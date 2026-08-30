import { describe, expect, it } from "vitest";
import {
  DRIFT_TOLERANCE,
  EXPECTED_LAYOUT,
  blankShareOf,
  layoutDrift,
  readsAsACv,
  type PrintedPage,
} from "../scripts/printedCv";

/**
 * The printing itself needs a browser and runs as its own CI step. What is
 * held here is the part that decides whether the printed layout still
 * matches the one that was chosen.
 *
 * This check used to fail any sheet more than a fifth blank, which had the
 * argument backwards: the gaps are the price of keeping a job entry off two
 * sheets, and that price was chosen deliberately. It records the shape
 * instead, and reports when it moves.
 */

const sheet = (number: number, blankShare: number, text = ["Bednarczyk"]): PrintedPage => ({
  number,
  height: 842,
  lowestText: blankShare * 842,
  text,
});

/** The recorded layout, reproduced exactly. */
const asRecorded = () => EXPECTED_LAYOUT.map((share, i) => sheet(i + 1, share));

describe("how full a sheet is", () => {
  it("measures the blank strip below the last line", () => {
    expect(blankShareOf({ ...sheet(1, 0), lowestText: 84.2 })).toBeCloseTo(0.1, 2);
  });

  it("calls a page with text at the very bottom full", () => {
    expect(blankShareOf({ ...sheet(1, 0), lowestText: 0 })).toBe(0);
  });

  it("does not divide by a height it was not given", () => {
    expect(blankShareOf({ ...sheet(1, 0.5), height: 0 })).toBe(0);
  });
});

describe("comparing a printed document to the recorded layout", () => {
  it("says nothing about the layout it recorded", () => {
    const drift = layoutDrift(asRecorded());

    expect(drift.lengthChanged).toBe(false);
    expect(drift.sheets).toEqual([]);
  });

  it("ignores a sheet that moved by less than the tolerance", () => {
    // A Chrome release nudging line breaking must not fail a build.
    const pages = asRecorded();
    pages[2] = sheet(3, EXPECTED_LAYOUT[2] + DRIFT_TOLERANCE / 2);

    expect(layoutDrift(pages).sheets).toEqual([]);
  });

  it("reports a sheet that moved by more, in both directions", () => {
    const fuller = asRecorded();
    fuller[0] = sheet(1, EXPECTED_LAYOUT[0] - DRIFT_TOLERANCE - 0.01);
    expect(layoutDrift(fuller).sheets.map((s) => s.sheet)).toEqual([1]);

    const emptier = asRecorded();
    emptier[0] = sheet(1, EXPECTED_LAYOUT[0] + DRIFT_TOLERANCE + 0.01);
    expect(layoutDrift(emptier).sheets.map((s) => s.sheet)).toEqual([1]);
  });

  it("notices the document changing length", () => {
    // Taking break-inside-avoid off the sections drops it to five sheets,
    // which is the change this exists to report.
    const shorter = asRecorded().slice(0, 5);

    expect(layoutDrift(shorter).lengthChanged).toBe(true);
  });

  it("reports a sheet nothing was recorded for", () => {
    const longer = [...asRecorded(), sheet(7, 0.4)];
    const drift = layoutDrift(longer);

    expect(drift.lengthChanged).toBe(true);
    expect(drift.sheets.map((s) => s.sheet)).toEqual([7]);
  });

  it("reports every sheet that moved, not just the first", () => {
    const pages = asRecorded();
    pages[0] = sheet(1, 0.1);
    pages[3] = sheet(4, 0.1);

    expect(layoutDrift(pages).sheets.map((s) => s.sheet)).toEqual([1, 4]);
  });

  it("carries both numbers, so a failure says what changed and to what", () => {
    const pages = asRecorded();
    pages[0] = sheet(1, 0.1);
    const [change] = layoutDrift(pages).sheets;

    expect(change.expected).toBe(EXPECTED_LAYOUT[0]);
    expect(change.measured).toBeCloseTo(0.1, 2);
  });

  it("keeps a tolerance smaller than the change it exists to catch", () => {
    // Removing break-inside-avoid moved sheets by 9 to 52 points. A
    // tolerance at or above that would admit the very change it watches for.
    expect(DRIFT_TOLERANCE).toBeLessThan(0.09);
    expect(DRIFT_TOLERANCE).toBeGreaterThan(0.02);
  });
});

describe("whether the extraction found anything at all", () => {
  it("accepts a document that carries the name", () => {
    expect(readsAsACv([sheet(1, 0.1, ["Remigiusz", "Bednarczyk"])], "Bednarczyk")).toBe(true);
  });

  it("refuses an empty document", () => {
    // Without this, a PDF that came back with no text has no sheets to
    // disagree about and passes everything above.
    expect(readsAsACv([], "Bednarczyk")).toBe(false);
  });

  it("refuses a document that is somebody else's", () => {
    expect(readsAsACv([sheet(1, 0.1, ["Lorem ipsum"])], "Bednarczyk")).toBe(false);
  });
});
