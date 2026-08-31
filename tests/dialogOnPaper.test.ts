import { describe, expect, it } from "vitest";
import { INK_TOLERANCE, whatADialogDidToThePrint } from "../scripts/printedCv";
import type { PrintedPage } from "../scripts/printedCv";

/**
 * The half of the dialog-on-paper check that needs no browser.
 *
 * The property is stated as a relationship — printing with a dialog open
 * must produce the same document as printing without one — rather than as a
 * list of words the CV may not contain. A word list would have to be kept in
 * step with the dialog's prose, and the first edit to that prose would
 * quietly empty the check while leaving it green.
 *
 * "The same document" turned out to be four claims, and the first version of
 * this made one of them. Each of the other three has a case below, and each
 * of those cases passed before the check was rewritten.
 */

const NAME = "Bednarczyk";

const sheet = (number: number, text: string[], ink = 0.04): PrintedPage => ({
  number,
  height: 842,
  lowestText: 100,
  text,
  ink,
});

const cv = [sheet(1, ["Remigiusz Bednarczyk", "Test Manager"]), sheet(2, ["Summary"])];

describe("what an open dialog did to the printed CV", () => {
  it("passes two prints that came back the same", () => {
    expect(whatADialogDidToThePrint(cv, cv, NAME)).toEqual([]);
  });

  it("names the sheets a dialog reached, and what it put there", () => {
    // Measured before the fix: the privacy dialog's text came back from all
    // six sheets, 36 to 37 strings each, because a fixed element repeats on
    // every printed page.
    const withDialog = [
      sheet(1, ["Remigiusz Bednarczyk", "Test Manager", "1. Data Controller"]),
      sheet(2, ["Summary", "1. Data Controller"]),
    ];

    const problems = whatADialogDidToThePrint(cv, withDialog, NAME);

    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain("sheet 1");
    expect(problems[0]).toContain("Data Controller");
    expect(problems[1]).toContain("sheet 2");
  });

  it("counts a sheet that gained one string as one, not as plural", () => {
    const [problem] = whatADialogDidToThePrint(
      [sheet(1, [NAME])],
      [sheet(1, [NAME, "Last updated"])],
      NAME,
    );

    expect(problem).toContain("1 string that");
  });

  it("reports a document that grew a sheet", () => {
    const [problem] = whatADialogDidToThePrint(cv, [...cv, sheet(3, ["Summary"])], NAME);

    expect(problem).toContain("3 sheets with a dialog open");
    expect(problem).toContain("2 without");
  });

  it("refuses to compare against nothing rather than passing", () => {
    // An empty baseline is the case where this check quietly becomes no
    // check at all: every sheet of the other document is "missing" from a
    // document that has no sheets, and a naive loop runs zero times.
    const [problem] = whatADialogDidToThePrint([], cv, NAME);

    expect(problem).toContain("printing without the dialog produced no sheet");
  });

  it("does not mind the order the PDF lists strings in", () => {
    // Text items come back in the order the PDF writes them, which is not
    // reading order and is not stable enough to assert on.
    expect(
      whatADialogDidToThePrint(
        [sheet(1, [NAME, "a", "b", "c"])],
        [sheet(1, ["c", NAME, "a", "b"])],
        NAME,
      ),
    ).toEqual([]);
  });

  /**
   * The three claims the first version did not make.
   *
   * All three passed it. They are not hypotheses: each is a way the printed
   * CV can come back wrong while a set-based, one-directional comparison of
   * added text reports "the same document".
   */
  describe("the ways a print can differ that are not added text", () => {
    it("guards the second document the way it guards the first", () => {
      // A print that came back textless — a failed render, a font the
      // reader cannot decode — adds no string to any sheet, so it read as
      // identical. readsAsACv exists for exactly this and was applied only
      // to the baseline.
      const [problem] = whatADialogDidToThePrint(cv, [sheet(1, []), sheet(2, [])], NAME);

      expect(problem).toContain("with the dialog open produced no sheet");
    });

    it("sees text an open dialog removed, not only text it added", () => {
      const [problem] = whatADialogDidToThePrint(
        cv,
        [sheet(1, ["Remigiusz Bednarczyk"]), sheet(2, ["Summary"])],
        NAME,
      );

      expect(problem).toContain("sheet 1 is missing 1 string");
      expect(problem).toContain("Test Manager");
    });

    it("sees a string printed twice where it was printed once", () => {
      // Set-based comparison cannot: the string is already in the baseline,
      // so the second copy is not "added".
      const [problem] = whatADialogDidToThePrint(
        [sheet(1, [NAME, "Summary"])],
        [sheet(1, [NAME, "Summary", "Summary"])],
        NAME,
      );

      expect(problem).toContain("1 string that printing without the dialog does not");
      expect(problem).toContain("Summary");
    });

    it("sees a sheet covered in ink with every string of it unchanged", () => {
      // The recorded defect had two halves and the check measured the one
      // made of words. Moving print:hidden from the dialog's shell to its
      // panel takes the text off paper and leaves the backdrop on it: the
      // sheet is dark end to end and no string has changed.
      const [problem] = whatADialogDidToThePrint(
        [sheet(1, [NAME], 0.04)],
        [sheet(1, [NAME], 0.64)],
        NAME,
      );

      expect(problem).toContain("64.0% covered in ink with the dialog open and 4.0% without");
    });

    it("lets a sheet through when the ink moved by less than the tolerance", () => {
      expect(
        whatADialogDidToThePrint(
          [sheet(1, [NAME], 0.04)],
          [sheet(1, [NAME], 0.04 + INK_TOLERANCE / 2)],
          NAME,
        ),
      ).toEqual([]);
    });

    it("sees a sheet that lost its ink as well as one that gained it", () => {
      // One-sidedness is a property of the comparison, not of one field of
      // it. A dialog that printed white over the page is the same defect
      // wearing the other colour.
      const [problem] = whatADialogDidToThePrint(
        [sheet(1, [NAME], 0.4)],
        [sheet(1, [NAME], 0.0)],
        NAME,
      );

      expect(problem).toContain("0.0% covered in ink with the dialog open and 40.0% without");
    });
  });
});
