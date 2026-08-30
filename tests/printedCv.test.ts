import { describe, expect, it } from "vitest";
import {
  MAX_BLANK_SHARE,
  blankShareOf,
  paginationFaults,
  readsAsACv,
  type PrintedPage,
} from "../scripts/printedCv";

/**
 * The printing itself needs a browser and runs as its own CI step. What is
 * held here is the part that decides whether a sheet is acceptable, which
 * is where a wrong answer would let the gap back in.
 */

const sheet = (number: number, lowestText: number, text = ["something"]): PrintedPage => ({
  number,
  height: 842,
  lowestText,
  text,
});

describe("how full a sheet is", () => {
  it("measures the blank strip below the last line", () => {
    // 842pt of A4, text down to 84pt from the foot: a tenth left blank.
    expect(blankShareOf(sheet(1, 84.2))).toBeCloseTo(0.1, 2);
  });

  it("calls a page with text at the very bottom full", () => {
    expect(blankShareOf(sheet(1, 0))).toBe(0);
  });

  it("does not divide by a height it was not given", () => {
    expect(blankShareOf({ ...sheet(1, 100), height: 0 })).toBe(0);
  });
});

describe("which sheets count as faulty", () => {
  it("says nothing about a document whose pages are full", () => {
    const pages = [sheet(1, 40), sheet(2, 60), sheet(3, 300)];

    expect(paginationFaults(pages)).toEqual([]);
  });

  it("reports the gap that started this, at the size it was", () => {
    // 58% of sheet 4 was blank, because a block that would not break moved
    // to the next page whole.
    const pages = [sheet(1, 40), sheet(2, 40), sheet(3, 40), sheet(4, 489), sheet(5, 100)];
    const faults = paginationFaults(pages);

    expect(faults).toHaveLength(1);
    expect(faults[0].page).toBe(4);
    expect(faults[0].reason).toContain("58%");
  });

  it("leaves the last sheet alone, because a document ends where it ends", () => {
    // Demanding a full final page would be demanding padding.
    expect(paginationFaults([sheet(1, 40), sheet(2, 700)])).toEqual([]);
  });

  it("reports every faulty sheet, not just the first", () => {
    const pages = [sheet(1, 320), sheet(2, 40), sheet(3, 489), sheet(4, 50)];

    expect(paginationFaults(pages).map((f) => f.page)).toEqual([1, 3]);
  });

  it("takes the threshold it is given", () => {
    const pages = [sheet(1, 200), sheet(2, 40)];

    expect(paginationFaults(pages, 0.1)).toHaveLength(1);
    expect(paginationFaults(pages, 0.5)).toHaveLength(0);
  });

  it("holds a threshold that would have caught the gap and not the good pages", () => {
    // 38% and 58% were the faults; 8% is the worst page of the CV as it
    // stands now. The line has to fall between them.
    expect(MAX_BLANK_SHARE).toBeGreaterThan(0.09);
    expect(MAX_BLANK_SHARE).toBeLessThan(0.38);
  });
});

describe("whether the extraction found anything at all", () => {
  it("accepts a document that carries the name", () => {
    expect(readsAsACv([sheet(1, 40, ["Remigiusz", "Bednarczyk"])], "Bednarczyk")).toBe(true);
  });

  it("refuses an empty document", () => {
    // Without this, a PDF that came back with no text passes every check
    // above by having no sheet that falls short.
    expect(readsAsACv([], "Bednarczyk")).toBe(false);
    expect(paginationFaults([])).toEqual([]);
  });

  it("refuses a document that is somebody else's", () => {
    expect(readsAsACv([sheet(1, 40, ["Lorem ipsum"])], "Bednarczyk")).toBe(false);
  });
});
