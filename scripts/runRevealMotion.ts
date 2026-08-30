import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium, type Browser } from "playwright";
import { serveDirectory } from "./staticServer.ts";
import {
  ARRIVING_AT_ONCE,
  SLIDING,
  failures,
  judgeDoesNotReplay,
  judgeOrdinary,
  judgeReduced,
  type Replay,
  type Slide,
} from "./revealMotion.ts";

/**
 * Watches sections arrive, with and without `prefers-reduced-motion`.
 *
 * This needs a real browser and cannot be faked in one: motion reads the
 * preference through matchMedia at load, and under jsdom both settings
 * animate identically — a test there passes whether or not the page honours
 * anything. Storybook's runner would have been the cheaper home, but its
 * config file is loaded through Jest, which refuses the module hooks
 * Storybook 10 registers, and every suite fails to run.
 *
 * What it caught when it was first written: twelve entrance animations
 * across nine files ignored the preference, while the particle canvas and
 * the 404 view honoured it. A section revealing moved through 32 distinct
 * positions either way.
 */

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const PORT = 5188;

/** One per grid shape, so a reveal broken in only one of them still shows. */
const WATCHED = ["expertise", "skills", "achievements"];

/** Long enough for a 0.5s reveal to finish and be seen finishing. */
const WATCH_MS = 1200;

async function slidesUnder(
  browser: Browser,
  reducedMotion: "reduce" | "no-preference",
): Promise<Slide[]> {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion,
  });

  try {
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });

    const slides: Slide[] = [];
    for (const section of WATCHED) {
      const positions = await page.evaluate(
        ([id, ms]) =>
          new Promise<number[]>((done) => {
            const outer = document.getElementById(id);
            if (!outer) return done([]);

            outer.scrollIntoView();
            const moving = outer.firstElementChild as HTMLElement;
            const seen: number[] = [];
            const started = performance.now();

            (function sample() {
              const { transform } = getComputedStyle(moving);
              const y =
                Math.round(
                  new DOMMatrix(transform === "none" ? undefined : transform).f * 10,
                ) / 10;
              if (seen[seen.length - 1] !== y) seen.push(y);

              if (performance.now() - started < ms) {
                requestAnimationFrame(sample);
              } else {
                done(seen);
              }
            })();
          }),
        [section, WATCH_MS] as [string, number],
      );

      if (positions.length === 0) {
        throw new Error(`there is no #${section} on the page to watch`);
      }
      slides.push({ section, positions });
    }

    return slides;
  } finally {
    await page.close();
  }
}

/**
 * Scrolls each section out of view and back, and reports what it did on the
 * way back. Nothing, if the reveal runs once.
 */
async function replaysAfterScrollingBack(browser: Browser): Promise<Replay[]> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });

    const replays: Replay[] = [];
    for (const section of WATCHED) {
      const positions = await page.evaluate(
        ([id, ms]) =>
          new Promise<number[]>((done) => {
            const outer = document.getElementById(id);
            if (!outer) return done([-1]);
            const moving = outer.firstElementChild as HTMLElement;

            const offset = () => {
              const { transform } = getComputedStyle(moving);
              return (
                Math.round(
                  new DOMMatrix(transform === "none" ? undefined : transform).f * 10,
                ) / 10
              );
            };

            outer.scrollIntoView();
            // Let it arrive, then leave and come back.
            setTimeout(() => {
              window.scrollTo(0, 0);
              setTimeout(() => {
                outer.scrollIntoView();
                const seen: number[] = [];
                const started = performance.now();

                (function sample() {
                  const y = offset();
                  if (seen[seen.length - 1] !== y) seen.push(y);
                  if (performance.now() - started < ms) {
                    requestAnimationFrame(sample);
                  } else {
                    done(seen);
                  }
                })();
              }, 200);
            }, ms);
          }),
        [section, WATCH_MS] as [string, number],
      );

      replays.push({ section, positions });
    }

    return replays;
  } finally {
    await page.close();
  }
}

async function main() {
  if (!existsSync(join(dist, "index.html"))) {
    throw new Error("dist/index.html is missing. Run `npm run build` first.");
  }

  const stop = await serveDirectory(dist, PORT);
  const browser = await chromium.launch();

  let ordinary: Slide[];
  let reduced: Slide[];
  let again: Replay[];
  try {
    ordinary = await slidesUnder(browser, "no-preference");
    reduced = await slidesUnder(browser, "reduce");
    again = await replaysAfterScrollingBack(browser);
  } finally {
    await browser.close();
    stop();
  }

  // Established first: the check below proves nothing if the sections do
  // not animate to begin with.
  const asDesigned = judgeOrdinary(ordinary);
  const asAsked = judgeReduced(reduced);
  const onTheWayBack = judgeDoesNotReplay(again);

  console.log("positions each section moved through as it arrived:");
  for (let i = 0; i < WATCHED.length; i += 1) {
    console.log(
      `  #${WATCHED[i]}: ${asDesigned[i].positions} as usual, ${asAsked[i].positions} for a visitor who asked for less motion`,
    );
  }

  console.log(
    `scrolled away and back: ${failures(onTheWayBack).length === 0 ? "none of them replayed" : "some replayed"}`,
  );

  const broken = [
    ...failures(asDesigned),
    ...failures(asAsked),
    ...failures(onTheWayBack),
  ];

  if (broken.length > 0) {
    throw new Error(
      `The sections no longer arrive the way this page says they do:\n  ${broken
        .map((v) => `#${v.section}: ${v.problem}`)
        .join("\n  ")}\n\n` +
        `MotionProvider sets reducedMotion="user", which switches transform animations off ` +
        `and leaves the fade alone: a reveal should take at least ${SLIDING} positions normally ` +
        `and at most ${ARRIVING_AT_ONCE} with the preference set. Reveal sets ` +
        `viewport.once, so a section arrives the first time it is seen and not again.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
