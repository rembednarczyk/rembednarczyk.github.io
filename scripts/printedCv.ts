/**
 * What a printed sheet is allowed to look like.
 *
 * The CV is the one thing this site produces that nobody sees on a screen,
 * and nothing checked it. It ran to six sheets with 38% of the first and
 * 58% of the fourth left blank, because every section and every job entry
 * carried break-inside-avoid: a block taller than the space left on a page
 * does not shrink to fit, it moves to the next page whole and leaves the
 * gap behind. Removing those rules brought it to five sheets with nothing
 * worse than the end of the document.
 *
 * Measured from the PDF the browser actually produces. An earlier attempt
 * measured heading positions in continuous layout and reported three
 * defects that pagination does not have — continuous layout has no pages
 * in it to be wrong about.
 */

export interface PrintedPage {
  /** 1-based, in reading order. */
  number: number;
  /** Height of the sheet in points, as the PDF declares it. */
  height: number;
  /** Distance from the foot of the sheet to the lowest text on it. */
  lowestText: number;
  /** Every non-empty string on the page, in the order the PDF lists them. */
  text: string[];
}

export interface PrintFault {
  page: number;
  blankShare: number;
  reason: string;
}

/**
 * How much of a sheet may be blank at the foot before it reads as a gap
 * rather than as the end of a paragraph.
 *
 * At the measured 8% the page looks full; at 38% it looks like something
 * went wrong. A fifth of a sheet is the line between the two, and it is
 * generous: every page of the current CV except the last sits under 9%.
 */
export const MAX_BLANK_SHARE = 0.2;

/** The share of a sheet left empty below the last line of text on it. */
export function blankShareOf(page: PrintedPage): number {
  if (page.height <= 0) return 0;
  return page.lowestText / page.height;
}

/**
 * Pages that stop well short of the foot.
 *
 * The last page is exempt: a document ends where it ends, and demanding a
 * full final sheet would be demanding padding.
 */
export function paginationFaults(
  pages: PrintedPage[],
  maxBlankShare = MAX_BLANK_SHARE,
): PrintFault[] {
  return pages
    .filter((page) => page.number < pages.length)
    .map((page) => ({ page: page.number, blankShare: blankShareOf(page) }))
    .filter(({ blankShare }) => blankShare > maxBlankShare)
    .map(({ page, blankShare }) => ({
      page,
      blankShare,
      reason: `${Math.round(blankShare * 100)}% of sheet ${page} is blank below the last line`,
    }));
}

/**
 * Whether the extraction found a document at all.
 *
 * Without this, a PDF that came out empty — a failed render, a font the
 * reader cannot decode — passes every check above by having no pages that
 * fall short.
 */
export function readsAsACv(pages: PrintedPage[], expectedName: string): boolean {
  const all = pages.flatMap((page) => page.text).join(" ");
  return pages.length > 0 && all.includes(expectedName);
}
