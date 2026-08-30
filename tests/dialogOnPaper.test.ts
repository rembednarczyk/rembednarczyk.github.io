import { describe, expect, it } from "vitest";
import { whatADialogAddedToThePrint } from "../scripts/printedCv";
import type { PrintedPage } from "../scripts/printedCv";

/**
 * The half of the dialog-on-paper check that needs no browser.
 *
 * The property is stated as a relationship — printing with a dialog open
 * must produce the same document as printing without one — rather than as a
 * list of words the CV may not contain. A word list would have to be kept in
 * step with the dialog's prose, and the first edit to that prose would
 * quietly empty the check while leaving it green.
 */

const sheet = (number: number, text: string[]): PrintedPage => ({
  number,
  height: 842,
  lowestText: 100,
  text,
});

const cv = [sheet(1, ["Remigiusz Bednarczyk", "Test Manager"]), sheet(2, ["Summary"])];

describe("what an open dialog added to the printed CV", () => {
  it("passes two prints that came back the same", () => {
    expect(whatADialogAddedToThePrint(cv, cv)).toEqual([]);
  });

  it("names the sheets a dialog reached, and what it put there", () => {
    // Measured before the fix: the privacy dialog's text came back from all
    // six sheets, 36 to 37 strings each, because a fixed element repeats on
    // every printed page.
    const withDialog = [
      sheet(1, ["Remigiusz Bednarczyk", "Test Manager", "1. Data Controller"]),
      sheet(2, ["Summary", "1. Data Controller"]),
    ];

    const problems = whatADialogAddedToThePrint(cv, withDialog);

    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain("sheet 1");
    expect(problems[0]).toContain("Data Controller");
    expect(problems[1]).toContain("sheet 2");
  });

  it("counts a sheet that gained one string as one, not as plural", () => {
    const [problem] = whatADialogAddedToThePrint(
      [sheet(1, ["Summary"])],
      [sheet(1, ["Summary", "Last updated"])],
    );

    expect(problem).toContain("1 string that");
  });

  it("reports a document that grew a sheet", () => {
    const [problem] = whatADialogAddedToThePrint(cv, [...cv, sheet(3, ["Summary"])]);

    expect(problem).toContain("3 sheets with a dialog open");
    expect(problem).toContain("2 without");
  });

  it("refuses to compare against nothing rather than passing", () => {
    // An empty baseline is the case where this check quietly becomes no
    // check at all: every sheet of the other document is "missing" from a
    // document that has no sheets, and a naive loop runs zero times.
    const [problem] = whatADialogAddedToThePrint([], cv);

    expect(problem).toContain("nothing was printed without the dialog");
  });

  it("does not mind the order the PDF lists strings in", () => {
    // Text items come back in the order the PDF writes them, which is not
    // reading order and is not stable enough to assert on.
    expect(
      whatADialogAddedToThePrint(
        [sheet(1, ["a", "b", "c"])],
        [sheet(1, ["c", "a", "b"])],
      ),
    ).toEqual([]);
  });
});
