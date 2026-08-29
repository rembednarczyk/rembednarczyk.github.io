import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  median,
  parseBadgeScores,
  shortfalls,
  toBadgeScale,
} from "../scripts/lighthouse";

/**
 * The audit itself needs a browser and a minute, so it runs as its own CI
 * step rather than here. What is worth holding in the fast suite is the
 * part that decides whether the audit passes: read the wrong number out of
 * the README and the gate measures the site against nothing.
 */

const readme = readFileSync(resolve(__dirname, "..", "README.md"), "utf8");

describe("reading the claim out of the README", () => {
  it("finds all four badges in the README as it stands", () => {
    // Against the real file, so a rewritten badge line is reported here
    // rather than an hour later in CI.
    const claimed = parseBadgeScores(readme);

    expect(Object.keys(claimed).sort()).toEqual([...CATEGORIES].sort());
    for (const category of CATEGORIES) {
      expect(claimed[category]).toBeGreaterThan(0);
      expect(claimed[category]).toBeLessThanOrEqual(100);
    }
  });

  it("reads the number a badge shows, not a number near it", () => {
    const claimed = parseBadgeScores(
      "[![Performance](https://img.shields.io/badge/Performance-88-00CC66?logo=lighthouse&logoColor=white)]" +
        "(https://example.com/) 100 100 100" +
        "[![Accessibility](https://img.shields.io/badge/Accessibility-100-00CC66?logo=lighthouse)]" +
        "[![Best Practices](https://img.shields.io/badge/Best%20Practices-97-00CC66?logo=lighthouse)]" +
        "[![SEO](https://img.shields.io/badge/SEO-91-00CC66?logo=lighthouse)]",
    );

    expect(claimed).toEqual({
      performance: 88,
      accessibility: 100,
      "best-practices": 97,
      seo: 91,
    });
  });

  it("refuses a README that has dropped a badge", () => {
    // Otherwise deleting the badge would be the cheapest way to pass, and
    // the gate would silently stop covering that category.
    expect(() =>
      parseBadgeScores(
        "[![Performance](https://img.shields.io/badge/Performance-100-00CC66?logo=lighthouse)]",
      ),
    ).toThrow(/no Lighthouse badge for/);
  });

  it("refuses a badge it does not recognise", () => {
    expect(() =>
      parseBadgeScores(
        "[![Vibes](https://img.shields.io/badge/Vibes-100-00CC66?logo=lighthouse)]",
      ),
    ).toThrow(/unrecognised/);
  });

  it("ignores badges that are not Lighthouse ones", () => {
    // The README carries React, TypeScript, Vite and Tailwind badges in the
    // same shape, and a version number is not a score.
    expect(() =>
      parseBadgeScores(
        "[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)]",
      ),
    ).toThrow(/no Lighthouse badge for/);
  });
});

describe("the median", () => {
  it("takes the middle of three runs, not the best of them", () => {
    // A maximum could be reached by running until a good one appears.
    expect(median([100, 98, 99])).toBe(99);
    expect(median([100, 100, 87])).toBe(100);
    expect(median([87, 100, 100])).toBe(100);
  });

  it("handles a single run", () => {
    expect(median([94])).toBe(94);
  });

  it("refuses to invent a value when nothing ran", () => {
    expect(() => median([])).toThrow(/no runs/);
  });
});

describe("comparing what was measured to what was claimed", () => {
  const perfect = {
    performance: 100,
    accessibility: 100,
    "best-practices": 100,
    seo: 100,
  } as const;

  it("says nothing when the page reaches every claim", () => {
    expect(shortfalls({ ...perfect }, { ...perfect })).toEqual([]);
  });

  it("reports each category that falls short, with both numbers", () => {
    const measured = { ...perfect, performance: 84, "best-practices": 96 };

    expect(shortfalls(measured, { ...perfect })).toEqual([
      { category: "performance", claimed: 100, measured: 84 },
      { category: "best-practices", claimed: 100, measured: 96 },
    ]);
  });

  it("accepts a page that beats its badge", () => {
    // A modest badge is not a failure; only a badge nobody can back is.
    const claimed = { ...perfect, performance: 90 };
    expect(shortfalls({ ...perfect }, claimed)).toEqual([]);
  });
});

describe("the scale", () => {
  it("turns Lighthouse's 0-1 into the 0-100 the badges use", () => {
    expect(toBadgeScale(1)).toBe(100);
    expect(toBadgeScale(0.955)).toBe(96);
    expect(toBadgeScale(0)).toBe(0);
  });

  it("treats a missing score as zero rather than as a pass", () => {
    // A category Lighthouse failed to compute must not read as 100.
    expect(toBadgeScale(null)).toBe(0);
    expect(toBadgeScale(undefined)).toBe(0);
  });
});
