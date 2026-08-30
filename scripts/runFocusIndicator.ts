import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright";
import { PNG } from "pngjs";
import { serveDirectory } from "./staticServer.ts";
import {
  ENOUGH_IN_PAGE_COLOUR,
  PAINTS_SOMETHING,
  failures,
  judgeFocus,
  type Stop,
} from "./focusIndicator.ts";

/**
 * Tabs the built page and checks that every stop shows where the keyboard is.
 *
 * What this catches that reading the source cannot: a new control added with
 * no focus style of its own. That is not hypothetical — every link on a
 * project card was in that state, eight controls falling back to the
 * browser's own ring, and no test in this repository had anything to say
 * about it.
 *
 * It checks the colour, not just that something changed. The first version
 * did not, and with `focus-ring` stripped from those same links it reported
 * all twenty-eight stops as fine: Chrome draws a ring where the page draws
 * none, so "something painted" is true either way.
 *
 * It compares pixels rather than computed styles, because a computed style
 * lies twice here. `outline-style: auto` reports a colour Chrome does not
 * paint, and a control mid-transition reports the indicator it is still
 * fading in — reading it a frame after Tab called 14 of 29 stops blank.
 */

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const PORT = 5189;

/** Wide enough to contain an indicator drawn outside the control. */
const MARGIN = 8;

/** cyan-400, what `focus-ring` draws, as the screenshot renders it. */
const CYAN = { r: 34, g: 211, b: 238 };

/** Loose enough for antialiasing at the edge of a two-pixel line. */
const CLOSE_ENOUGH = 60;

function isPageCyan(r: number, g: number, b: number): boolean {
  return (
    Math.abs(r - CYAN.r) < CLOSE_ENOUGH &&
    Math.abs(g - CYAN.g) < CLOSE_ENOUGH &&
    Math.abs(b - CYAN.b) < CLOSE_ENOUGH
  );
}

/** Long enough for a `transition-all` control to finish fading its ring in. */
const SETTLE_MS = 450;

async function tabOrder(page: Page): Promise<string[]> {
  const order: string[] = [];
  const seen = new Set<string>();

  // Start the sequential focus walk at the top of the document. Without
  // this the walk resumed from wherever focus had last been — and after the
  // consent bar was dismissed that element no longer existed, so the first
  // Tab moved nowhere and the sweep found nothing.
  await page.evaluate(() => {
    document.body.setAttribute("tabindex", "-1");
    document.body.focus();
  });

  for (let i = 0; i < 200; i += 1) {
    await page.keyboard.press("Tab");
    const id = await page.evaluate(() => {
      const el = document.activeElement;
      return !el || el === document.body ? null : el.getAttribute("data-probe");
    });
    if (!id || seen.has(id)) break;
    seen.add(id);
    order.push(id);
  }

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
  return order;
}

async function paintedBy(page: Page, probe: string): Promise<Stop> {
  // The box is measured while the control is focused, because focus is what
  // decides where it is. The skip link is 1x1 at -1,-1 until focused and
  // 189x40 at 16,16 after: a clip taken from its resting box watched a
  // seventeen-pixel square of empty corner and called it blank.
  const box = await page.evaluate(
    ([id, pad]) => {
      const el = document.querySelector<HTMLElement>(`[data-probe="${id}"]`);
      if (!el) return null;
      el.focus();
      el.scrollIntoView({ block: "center", behavior: "instant" });
      const r = el.getBoundingClientRect();
      const name = (
        el.getAttribute("aria-label") ||
        el.textContent ||
        el.tagName
      ).trim().slice(0, 36);
      el.blur();

      if (r.width === 0 || r.height === 0) return { name, x: 0, y: 0, width: 0, height: 0 };
      return {
        name,
        x: Math.max(0, Math.floor(r.left - pad)),
        y: Math.max(0, Math.floor(r.top - pad)),
        width: Math.min(Math.ceil(r.width + pad * 2), innerWidth),
        height: Math.min(Math.ceil(r.height + pad * 2), innerHeight),
      };
    },
    [probe, MARGIN] as [string, number],
  );

  if (!box) return { name: probe, painted: 0, inPageColour: 0, unmeasured: true };
  if (box.width === 0 || box.height === 0) {
    return { name: box.name, painted: 0, inPageColour: 0, unmeasured: true };
  }
  await page.waitForTimeout(200);

  const clip = { x: box.x, y: box.y, width: box.width, height: box.height };
  const blurred = await page.screenshot({ clip });
  await page.evaluate(
    (id) => (document.querySelector(`[data-probe="${id}"]`) as HTMLElement).focus(),
    probe,
  );
  await page.waitForTimeout(SETTLE_MS);
  const focused = await page.screenshot({ clip });
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
  await page.waitForTimeout(150);

  const before = PNG.sync.read(blurred);
  const after = PNG.sync.read(focused);
  if (before.width !== after.width || before.height !== after.height) {
    return { name: box.name, painted: 0, inPageColour: 0, unmeasured: true };
  }

  let painted = 0;
  let inPageColour = 0;
  for (let i = 0; i < before.data.length; i += 4) {
    if (
      Math.abs(before.data[i] - after.data[i]) > 16 ||
      Math.abs(before.data[i + 1] - after.data[i + 1]) > 16 ||
      Math.abs(before.data[i + 2] - after.data[i + 2]) > 16
    ) {
      painted += 1;
      if (isPageCyan(after.data[i], after.data[i + 1], after.data[i + 2])) {
        inPageColour += 1;
      }
    }
  }

  return { name: box.name, painted, inPageColour };
}

async function main() {
  if (!existsSync(join(dist, "index.html"))) {
    throw new Error("dist/index.html is missing. Run `npm run build` first.");
  }

  const stop = await serveDirectory(dist, PORT);
  const browser = await chromium.launch();

  let stops: Stop[];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });

    // Walk the page so everything revealed on scroll is present and settled.
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((v) => scrollTo(0, v), y);
      await page.waitForTimeout(70);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);

    const label = () =>
      page.evaluate(() =>
        document.querySelectorAll("*").forEach((el, i) => el.setAttribute("data-probe", String(i))),
      );

    // The consent bar's own controls first, while it is showing. It is the
    // one part of the page that disappears for good once answered, so a
    // sweep that starts by dismissing it never looks at three buttons.
    await label();
    const inTheBar = await page.evaluate(() =>
      [...(document.querySelector('[aria-label="Cookie consent"]')?.querySelectorAll("button, a") ?? [])]
        .map((el) => el.getAttribute("data-probe") ?? ""),
    );
    if (inTheBar.length < 3) {
      throw new Error(
        `the consent bar should offer three controls and ${inTheBar.length} were found — it did not render, and the sweep below dismisses it`,
      );
    }

    stops = [];
    for (const probe of inTheBar) stops.push(await paintedBy(page, probe));

    // Then the rest, with the bar out of the way. It covers the foot of the
    // page, including controls the browser scrolls a visitor to.
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent?.trim() === "Accept")
        ?.click(),
    );
    await page.waitForTimeout(600);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    await label();

    const order = await tabOrder(page);
    if (order.length < 20) {
      throw new Error(
        `only ${order.length} keyboard stops were found, and there should be far more — the sweep stopped early and everything below would pass on almost nothing`,
      );
    }

    for (const probe of order) stops.push(await paintedBy(page, probe));
  } finally {
    await browser.close();
    stop();
  }

  const verdicts = judgeFocus(stops);
  const broken = failures(verdicts);

  console.log(`${stops.length} keyboard stops; ${verdicts.length - broken.length} show where the keyboard is`);

  if (broken.length > 0) {
    throw new Error(
      `Some controls do not show keyboard focus:\n  ${broken
        .map((v) => `${v.name}: ${v.problem}`)
        .join("\n  ")}\n\n` +
        `Every interactive element should carry \`focus-ring\` (or \`focus-ring-always\` for a ` +
        `text field), defined in src/index.css. An indicator paints well over ${PAINTS_SOMETHING} ` +
        `pixels — the smallest on this page paints 287 — of which at least ${ENOUGH_IN_PAGE_COLOUR} ` +
        `must be the page's cyan. A control with no style of its own still paints, because Chrome ` +
        `draws its own ring; the colour is what tells the two apart.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
