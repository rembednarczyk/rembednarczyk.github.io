import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright";
import { serveDirectory } from "./staticServer.ts";
import {
  ENHANCED,
  judgeTargetSize,
  staleExemptions,
  tooSmall,
  type Target,
} from "./targetSize.ts";

/**
 * Measures every pointer target on the built page against SC 2.5.5.
 *
 * A browser, because this is geometry after layout: a control's tap area is
 * its box plus its padding at the width it is actually rendered at, and no
 * amount of reading Tailwind classes produces that number. It is the same
 * argument the focus gate makes and the same shape of gate.
 */

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const PORT = 5191;

/**
 * Both ends of the layout.
 *
 * The page reflows: at 1280px the navigation is eight text buttons in a
 * row, at 375px it is one toggle and a dropdown. They are different
 * controls with different sizes, so one width would measure half of them.
 */
const WIDTHS = [1280, 375];

/** What a pointer can activate. */
const INTERACTIVE =
  'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"]';

/**
 * Measured with the control focused.
 *
 * The skip link is `sr-only` until it is reached, so its box unfocused is
 * 1x1 — measure it there and the gate reports the page's most deliberate
 * piece of accessibility work as its worst failure. Focused it is 189x40,
 * which is a real number about a real control. Every target is focused
 * before it is measured rather than only that one, because a rule with an
 * exception for the case that embarrassed it is not a rule.
 */
async function targetsOn(page: Page, where: string): Promise<Target[]> {
  return page.evaluate(
    ({ selector, atWhere }) => {
      const controls = [...document.querySelectorAll(selector)] as HTMLElement[];

      return controls.flatMap((element) => {
        element.focus();

        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        // Nothing to tap: hidden, collapsed, or a control in a menu that is
        // shut. A closed menu's items are not targets until it opens, and
        // the sweep opens it below.
        if (box.width === 0 || box.height === 0) return [];
        if (style.visibility === "hidden" || style.display === "none") return [];

        const own = (element.textContent ?? "").trim().length;
        const around = (element.parentElement?.textContent ?? "").trim().length;

        return [
          {
            label:
              (element.getAttribute("aria-label") ?? element.textContent ?? "")
                .trim()
                .replace(/\s+/g, " ")
                .slice(0, 40) || `<${element.tagName.toLowerCase()}>`,
            tag: element.tagName.toLowerCase(),
            where: atWhere,
            width: box.width,
            height: box.height,
            // A target "in a sentence or block of text", which SC 2.5.5
            // exempts. Twelve characters of slack so a link that is nearly
            // the whole of its parent does not read as prose around it.
            inline: style.display.startsWith("inline") && around > own + 12,
          },
        ];
      });
    },
    { selector: INTERACTIVE, atWhere: where },
  );
}

/** Opens the mobile navigation, whose items exist only while it is open. */
async function openTheMenu(page: Page): Promise<boolean> {
  const opened = await page.evaluate(() => {
    const toggle = [...document.querySelectorAll("button")].find((button) =>
      /toggle mobile menu/i.test(button.getAttribute("aria-label") ?? ""),
    );
    if (!toggle) return false;
    toggle.click();
    return true;
  });

  if (opened) await page.waitForTimeout(400);
  return opened;
}

async function main() {
  if (!existsSync(join(dist, "index.html"))) {
    throw new Error("dist/index.html is missing. Run `npm run build` first.");
  }

  const stop = await serveDirectory(dist, PORT);
  const browser = await chromium.launch();
  const measured: Target[] = [];

  try {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });

      // Everything below the fold reveals on scroll, and a section that has
      // not revealed has no controls to measure. The first version of the
      // focus gate lost seven stops to exactly this.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1200);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);

      measured.push(...(await targetsOn(page, `${width}px`)));

      if (width < 640) {
        const opened = await openTheMenu(page);
        if (!opened) {
          throw new Error(
            "no control opened the mobile menu, so its items were never measured",
          );
        }
        measured.push(...(await targetsOn(page, `${width}px, menu open`)));
      }

      await page.close();
    }
  } finally {
    await browser.close();
    stop();
  }

  const verdicts = judgeTargetSize(measured);
  const failures = tooSmall(verdicts);
  const stale = staleExemptions(measured);

  console.log(
    `${verdicts.length} pointer targets measured across ${WIDTHS.join("px and ")}px; ` +
      `${verdicts.length - failures.length} are at least ${ENHANCED}x${ENHANCED}`,
  );

  // A count that only ever goes up cannot report a sweep that stopped
  // early, which is the defect the focus gate was caught by twice.
  if (verdicts.length < EXPECTED_TARGETS) {
    throw new Error(
      `only ${verdicts.length} targets were found and ${EXPECTED_TARGETS} were recorded. ` +
        `Either the sweep stopped early or the page lost controls; both are worth knowing, ` +
        `and neither shows up as a failure below.`,
    );
  }

  if (stale.length > 0) {
    throw new Error(
      `DELIBERATELY_SMALL names targets the page no longer has:\n  ${stale.join("\n  ")}\n\n` +
        `An exemption list that can only be added to is a list that grows.`,
    );
  }

  if (failures.length > 0) {
    throw new Error(
      `${failures.length} targets are smaller than SC 2.5.5 asks for:\n  ` +
        failures
          .map((f) => `${f.where}  ${JSON.stringify(f.label)}: ${f.problem}`)
          .join("\n  ") +
        `\n\nThe usual fix is padding rather than size: a control keeps the type and the icon ` +
        `it has and grows its tap area around them, which changes nothing on screen. This page ` +
        `holds itself to AAA on focus (SC 2.4.12), so the consistent bar for a thumb is ` +
        `SC 2.5.5 at ${ENHANCED}x${ENHANCED} and not the AA minimum of 24x24.`,
    );
  }
}

/**
 * How many targets the sweep finds, recorded rather than floored.
 *
 * A floor is the wrong instrument for a sweep that can stop early: the
 * focus gate was floored at "more than 20" while the page had 28, so a
 * truncation to 21 reported success. Measured, per the widths above.
 */
const EXPECTED_TARGETS = 79;

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
