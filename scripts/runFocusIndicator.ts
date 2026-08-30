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
  judgeNotObscured,
  type Overlaid,
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

/**
 * Where the consent banner is checked. It reflows between these: its buttons
 * sit beside the text at 1280 and the card nearly fills the viewport at 768,
 * which is where the scroll-to-top button used to land on top of Accept.
 */
const BANNER_WIDTHS = [1280, 768];

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

/**
 * Walks the tab order while the consent banner is showing, and reports what
 * the banner does to each control it is not part of.
 *
 * This has to run before the banner is dismissed, and it has to combine
 * geometry with a hit test: a control can sit behind the card and still
 * paint over it. Measuring geometry alone called the scroll-to-top button
 * obscured when it was the one doing the obscuring.
 */
async function underTheBanner(page: Page): Promise<Overlaid[]> {
  const order = await tabOrder(page);
  const controls: Overlaid[] = [];

  for (const probe of order) {
    const row = await page.evaluate((id) => {
      const el = document.querySelector<HTMLElement>(`[data-probe="${id}"]`);
      const region = document.querySelector('[aria-label="Cookie consent"]');
      const card = region?.firstElementChild;
      if (!el || !region || !card) return null;
      // The banner's own controls are meant to be in front of everything.
      if (region.contains(el)) return null;

      el.focus();
      const a = el.getBoundingClientRect();
      const name = (
        el.getAttribute("aria-label") ||
        el.textContent ||
        el.tagName
      ).trim().slice(0, 34);
      if (a.width === 0 || a.height === 0) {
        return { name, coveredByCard: 0, clickReaches: true, blockedBy: "" };
      }

      const b = card.getBoundingClientRect();
      const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

      const cx = a.left + a.width / 2;
      const cy = a.top + a.height / 2;
      const onScreen = cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight;
      const top = onScreen ? document.elementFromPoint(cx, cy) : null;
      const reaches = !onScreen || !!(top && (el === top || el.contains(top)));

      // Inside the part the two share, which is the only place the question
      // "is it behind the banner" has an answer. The centre is no use: a
      // control whose middle clears the card can still have its lower half
      // behind it, and the scroll-to-top button lies entirely inside the
      // band's box while painting over it.
      let inFrontWhereCovered: boolean | undefined;
      if (w > 0 && h > 0) {
        const ox = Math.max(a.left, b.left) + w / 2;
        const oy = Math.max(a.top, b.top) + h / 2;
        const overThere = document.elementFromPoint(ox, oy);
        inFrontWhereCovered = !!(
          overThere && (el === overThere || el.contains(overThere))
        );
      }

      return {
        name,
        coveredByCard: (w * h) / (a.width * a.height),
        clickReaches: reaches,
        blockedBy: reaches || !top
          ? ""
          : region.contains(top)
            ? "the consent banner"
            : top.tagName.toLowerCase(),
        inFrontWhereCovered,
      };
    }, probe);

    if (row) controls.push(row);
  }

  // And the banner's own buttons, which are meant to be in front of
  // everything. Sampled across rather than at the centre: the scroll-to-top
  // button covered the right third of Accept while leaving its middle
  // clickable, so a centre-only test called it fine.
  const ownControls = await page.evaluate(() => {
    const region = document.querySelector('[aria-label="Cookie consent"]');
    if (!region) return [];

    return [...region.querySelectorAll("button, a")].map((el) => {
      const a = el.getBoundingClientRect();
      const name = (el.getAttribute("aria-label") || el.textContent || el.tagName)
        .trim()
        .slice(0, 34);

      for (const across of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        const x = a.left + a.width * across;
        const y = a.top + a.height / 2;
        const top = document.elementFromPoint(x, y);
        if (!top || !(el === top || el.contains(top))) {
          return {
            name,
            coveredByCard: 0,
            clickReaches: false,
            blockedBy: top
              ? top.getAttribute("aria-label") || top.tagName.toLowerCase()
              : "nothing",
            partOfTheBanner: true,
            failedAt: across,
          };
        }
      }

      return {
        name,
        coveredByCard: 0,
        clickReaches: true,
        blockedBy: "",
        partOfTheBanner: true,
      };
    });
  });

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
  return [...controls, ...ownControls];
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

    // What the banner does to everything else, while it is still up, at two
    // widths. The banner reflows and so does the page: the scroll-to-top
    // button cleared it entirely at 1280 and took a third of Accept at 768,
    // so one width would have proved nothing about the other.
    const shadowed: { width: number; name: string; problem: string }[] = [];
    let checked = 0;

    for (const width of BANNER_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(400);
      await label();

      const overlaid = await underTheBanner(page);
      checked += overlaid.length;
      shadowed.push(
        ...failures(judgeNotObscured(overlaid)).map((v) => ({
          width,
          name: v.name,
          problem: v.problem,
        })),
      );
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(300);

    console.log(
      `${checked} control checks against the consent banner across ${BANNER_WIDTHS.join("px and ")}px; ${checked - shadowed.length} clear of it`,
    );

    if (shadowed.length > 0) {
      throw new Error(
        `The consent banner is in the way of controls behind it:\n  ${shadowed
          .map((v) => `at ${v.width}px, ${v.name}: ${v.problem}`)
          .join("\n  ")}\n\n` +
          `The banner's band is pointer-events-none and only its card takes clicks, ` +
          `useSpaceForFixedBar reserves the height it covers so nothing is scrolled under it, ` +
          `and the scroll-to-top button stands down while the banner is up.`,
      );
    }

    // Then the rest, with the bar out of the way. It covers the foot of the
    // page, including controls the browser scrolls a visitor to.
    //
    // Answer it and reload rather than carrying on: the walk above focused
    // every control and left the page scrolled somewhere, and the button
    // that appears only after 300px of scrolling then entered the tab order
    // and unmounted again before it could be measured. The choice is in
    // localStorage, so the reload comes back with the banner already
    // answered and the page at the top.
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent?.trim() === "Accept")
        ?.click(),
    );
    await page.waitForTimeout(400);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    const reloaded = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < reloaded; y += 600) {
      await page.evaluate((v) => scrollTo(0, v), y);
      await page.waitForTimeout(70);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
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
