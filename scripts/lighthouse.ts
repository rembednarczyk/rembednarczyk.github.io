/**
 * Holds the README's Lighthouse badges to a measurement.
 *
 * Four badges have claimed 100 since before any of this work started, and
 * nothing anywhere re-derived them. They were a screenshot of a number
 * somebody once saw. Engineering Principles, section 1: never trust a
 * status quoted in prose.
 *
 * The badges are not duplicated here as thresholds. They are read out of
 * the README and used as the thresholds, so lowering a badge to make a
 * build pass is a visible edit to the claim itself, and raising one without
 * earning it fails immediately.
 */

/** The categories Lighthouse reports, in the order the badges list them. */
export const CATEGORIES = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Badge label as written in the README -> the category it claims. */
const BADGE_LABELS: Record<string, Category> = {
  Performance: "performance",
  Accessibility: "accessibility",
  "Best Practices": "best-practices",
  SEO: "seo",
};

/**
 * Reads the four claims out of the README's shields.io badges.
 *
 * A badge reads `![Performance](https://img.shields.io/badge/Performance-100-00CC66?...)`,
 * and `Best Practices` arrives percent-encoded.
 */
export function parseBadgeScores(readme: string): Record<Category, number> {
  const found = new Map<Category, number>();

  const badges = readme.matchAll(
    /img\.shields\.io\/badge\/([^-]+)-(\d+)-[0-9A-Fa-f]{6}\?logo=lighthouse/g,
  );

  for (const [, rawLabel, rawScore] of badges) {
    const label = decodeURIComponent(rawLabel.replace(/_/g, " "));
    const category = BADGE_LABELS[label];

    if (!category) throw new Error(`unrecognised Lighthouse badge "${label}"`);
    found.set(category, Number(rawScore));
  }

  const missing = CATEGORIES.filter((c) => !found.has(c));
  if (missing.length > 0) {
    throw new Error(`the README has no Lighthouse badge for: ${missing.join(", ")}`);
  }

  return Object.fromEntries(
    CATEGORIES.map((c) => [c, found.get(c)!]),
  ) as Record<Category, number>;
}

/**
 * The middle value, which is what Lighthouse itself recommends reporting.
 *
 * A single run of a machine-dependent metric is noise; the median of an odd
 * number of runs is the standard answer, and unlike a maximum it cannot be
 * gamed by running until a good one appears.
 */
export function median(values: number[]): number {
  if (values.length === 0) throw new Error("no runs to take the median of");

  const sorted = [...values].sort((a, b) => a - b);
  return sorted[(sorted.length - 1) >> 1];
}

export interface Shortfall {
  category: Category;
  claimed: number;
  measured: number;
}

/** Every category where the page scores below what the README claims. */
export function shortfalls(
  measured: Record<Category, number>,
  claimed: Record<Category, number>,
): Shortfall[] {
  return CATEGORIES.filter((c) => measured[c] < claimed[c]).map((c) => ({
    category: c,
    claimed: claimed[c],
    measured: measured[c],
  }));
}

/** Lighthouse reports 0-1; the badges are written 0-100. */
export function toBadgeScale(score: number | null | undefined): number {
  if (typeof score !== "number") return 0;
  return Math.round(score * 100);
}
