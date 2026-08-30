/**
 * What the printed CV is supposed to look like.
 *
 * The CV is the one thing this site produces that nobody sees on a screen,
 * so nothing but this looks at it.
 *
 * It does not judge the layout. It was written to, and had the argument
 * backwards: it failed any sheet more than a fifth blank at the foot, on
 * the reasoning that a gap means a block too tall to fit moved to the next
 * page whole. That is exactly what happens here, and it is deliberate —
 * sections and job entries carry break-inside-avoid so that an entry is
 * never cut across two sheets, and the owner would rather have the gaps and
 * the sixth sheet than have entries split.
 *
 * So this records the shape that choice produces and reports when it
 * changes. A gap is not a fault; a gap nobody decided on is.
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

/**
 * The blank share of each sheet, in order, as the chosen layout produces
 * it. Measured from the PDF, not decided: sections kept whole leave these
 * gaps, and this is what they are.
 */
export const EXPECTED_LAYOUT = [0.38, 0.22, 0.14, 0.58, 0.05, 0.18];

/**
 * How far a sheet may drift before it is worth a look.
 *
 * Wide enough that a Chrome release nudging line breaking by a point or two
 * does not fail a build, narrow enough that a section moving across a page
 * boundary — which shifts a sheet by tens of points — does. Removing
 * break-inside-avoid moves every sheet by 9 to 52 points, and one sheet
 * disappears entirely.
 */
export const DRIFT_TOLERANCE = 0.08;

/** The share of a sheet left empty below the last line of text on it. */
export function blankShareOf(page: PrintedPage): number {
  if (page.height <= 0) return 0;
  return page.lowestText / page.height;
}

export interface LayoutChange {
  sheet: number;
  expected: number;
  measured: number;
}

/**
 * Sheets whose fill no longer matches the recorded layout, and a note if
 * the document changed length.
 */
export function layoutDrift(
  pages: PrintedPage[],
  expected: number[] = EXPECTED_LAYOUT,
  tolerance = DRIFT_TOLERANCE,
): { lengthChanged: boolean; sheets: LayoutChange[] } {
  const sheets = pages
    .map((page) => ({
      sheet: page.number,
      expected: expected[page.number - 1] ?? Number.NaN,
      measured: blankShareOf(page),
    }))
    .filter(
      ({ expected: want, measured }) =>
        Number.isNaN(want) || Math.abs(measured - want) > tolerance,
    );

  return { lengthChanged: pages.length !== expected.length, sheets };
}

/**
 * Whether the extraction found a document at all.
 *
 * Without this, a PDF that came out empty — a failed render, a font the
 * reader cannot decode — passes everything above by having no sheets to
 * disagree about.
 */
/**
 * What an open dialog put onto the printed CV.
 *
 * The dialog shell portals into `document.body`, which places it outside the
 * wrapper that hides the screen page from the printer. Printed with the
 * privacy policy open, its text came back from all six sheets — a fixed
 * element repeats on every page — and its backdrop left 96% of each sheet
 * dark. Nothing saw it, because the gate printed a freshly loaded page and
 * never opened anything.
 *
 * Stated as a relationship rather than a list of forbidden words: printing
 * with a dialog open must produce the same document as printing without it.
 * A word list would have to be kept in step with the dialog's prose, and the
 * first edit to that prose would quietly empty the check.
 */
export function whatADialogAddedToThePrint(
  withoutDialog: PrintedPage[],
  withDialog: PrintedPage[],
): string[] {
  const problems: string[] = [];

  if (withoutDialog.length === 0) {
    return ["nothing was printed without the dialog, so there is nothing to compare against"];
  }

  if (withDialog.length !== withoutDialog.length) {
    problems.push(
      `it runs to ${withDialog.length} sheets with a dialog open and ${withoutDialog.length} without one`,
    );
  }

  for (let i = 0; i < Math.min(withDialog.length, withoutDialog.length); i += 1) {
    const before = new Set(withoutDialog[i].text);
    const added = [...new Set(withDialog[i].text.filter((s) => !before.has(s)))];

    if (added.length > 0) {
      problems.push(
        `sheet ${i + 1} carries ${added.length} string${added.length === 1 ? "" : "s"} that printing without the dialog does not: ${added
          .slice(0, 4)
          .map((s) => JSON.stringify(s.trim().slice(0, 30)))
          .join(", ")}`,
      );
    }
  }

  return problems;
}

export function readsAsACv(pages: PrintedPage[], expectedName: string): boolean {
  const all = pages.flatMap((page) => page.text).join(" ");
  return pages.length > 0 && all.includes(expectedName);
}
