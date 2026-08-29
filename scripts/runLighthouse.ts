import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { chromium } from "playwright";
import { serveDirectory } from "./staticServer.ts";
import {
  CATEGORIES,
  median,
  parseBadgeScores,
  shortfalls,
  toBadgeScale,
  type Category,
} from "./lighthouse.ts";

/**
 * Measures the built site and holds the README's badges to the result.
 *
 * Run through `npm run check:lighthouse`, and in CI as its own step. It is
 * not part of `npm test`: it needs a browser and about a minute, and a
 * unit-test loop that slow stops being run.
 *
 * Desktop, deliberately and now stated in the README beside the badges.
 * The four badges never said which preset they came from, and the answer
 * turned out to matter: this page scores 100 on desktop and 98 on
 * Lighthouse's mobile emulation, so an unlabelled 100 was quietly the
 * better of the two numbers.
 */

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const PORT = 5199;
const RUNS = 3;

async function main() {
  if (!existsSync(join(dist, "index.html"))) {
    throw new Error("dist/index.html is missing. Run `npm run build` first.");
  }

  const claimed = parseBadgeScores(readFileSync(join(root, "README.md"), "utf8"));
  const stop = await serveDirectory(dist, PORT);

  // The same Chromium the Storybook stage already installs, so CI has one
  // browser to provision rather than two that can disagree. CHROME_PATH is
  // chrome-launcher's own override and wins where an environment ships its
  // browser somewhere else.
  const chrome = await launch({
    chromePath: process.env["CHROME_PATH"] ?? chromium.executablePath(),
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
  });

  const runs: Record<Category, number>[] = [];

  try {
    for (let run = 0; run < RUNS; run += 1) {
      const result = await lighthouse(
        `http://127.0.0.1:${PORT}/`,
        {
          port: chrome.port,
          output: "json",
          logLevel: "error",

          /**
           * The analytics tag is not in the deploy and is not ours to fix.
           * Left reachable, whether it loads decides the score: a network
           * that blocks it turns "Browser errors were logged to the
           * console" red and takes Best Practices to 96, which says
           * something about the network and nothing about the site.
           *
           * Blocked, the measurement is of what this build actually ships,
           * and it is the same number on a laptop, in CI and here. The cost
           * is that a fault inside the tag itself would not be reported,
           * which is the right way round: a third party being unreachable
           * must not turn the build red.
           */
          blockedUrlPatterns: ["*googletagmanager.com*"],
        },
        desktopConfig,
      );

      if (!result) throw new Error("Lighthouse returned nothing");

      const scores = Object.fromEntries(
        CATEGORIES.map((c) => [
          c,
          toBadgeScale(result.lhr.categories[c]?.score),
        ]),
      ) as Record<Category, number>;

      console.log(
        `run ${run + 1}/${RUNS}:`,
        CATEGORIES.map((c) => `${c} ${scores[c]}`).join("  "),
      );
      runs.push(scores);
    }
  } finally {
    chrome.kill();
    stop();
  }

  const measured = Object.fromEntries(
    CATEGORIES.map((c) => [c, median(runs.map((r) => r[c]))]),
  ) as Record<Category, number>;

  console.log("\nmedian of %d runs, against what the README claims:", RUNS);
  for (const category of CATEGORIES) {
    const mark = measured[category] >= claimed[category] ? "ok" : "SHORT";
    console.log(
      `  ${category.padEnd(15)} claimed ${claimed[category]}  measured ${measured[category]}  ${mark}`,
    );
  }

  const short = shortfalls(measured, claimed);

  if (short.length > 0) {
    const lines = short.map(
      (s) => `  ${s.category}: the README claims ${s.claimed}, the page scores ${s.measured}`,
    );
    throw new Error(
      `The README claims scores the site does not reach:\n${lines.join("\n")}\n\n` +
        "Either fix the page or change the badge. A badge nobody can back is worse than no badge.",
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
