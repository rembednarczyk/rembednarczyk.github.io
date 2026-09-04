/**
 * The day the content last changed, as the build learned it, and one way to
 * write a day out.
 *
 * `VITE_CONTENT_UPDATED` is defined by vite.config.ts at build from the last
 * commit that touched `src/content` (scripts/contentDate.ts says how, and
 * what happens when git cannot say). It is a `YYYY-MM-DD` string or absent —
 * absent under vitest and in a dev server started without a build, so
 * whatever renders it must be able to render nothing.
 *
 * The formatter is here rather than beside each use because three places
 * write a date — the footer, the printed CV, the privacy policy — and a date
 * written three ways is a page that looks maintained by three people.
 * Formatted in UTC on purpose: the value is a day, not a moment, and a day
 * parsed as local midnight shows as the day before to anyone west of it.
 */
// Dotted, not `import.meta.env["…"]`: Vite's `define` replaces the exact
// expression `import.meta.env.VITE_CONTENT_UPDATED` at build, and a bracket
// lookup on the env object finds nothing — measured: the day was stamped
// into the sitemap and absent from the bundle. The property is declared in
// src/vite-env.d.ts.
export const CONTENT_UPDATED: string | undefined = import.meta.env.VITE_CONTENT_UPDATED;

/** "4 September 2026" for `long`; "September 2026" for `month`. */
export function formatIsoDate(isoDay: string, style: "long" | "month"): string {
  const date = new Date(`${isoDay}T00:00:00Z`);

  return date.toLocaleDateString("en-GB", {
    ...(style === "long" ? { day: "numeric" } : {}),
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
