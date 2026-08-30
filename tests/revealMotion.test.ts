import { describe, expect, it } from "vitest";
import {
  ARRIVING_AT_ONCE,
  SLIDING,
  failures,
  judgeDoesNotReplay,
  judgeOrdinary,
  judgeReduced,
  type Slide,
} from "../scripts/revealMotion";

/**
 * The browser half of this gate needs a browser. This is the half that
 * decides what the positions mean, which is where the mistake would be:
 * a rule that passes a page with no reveal at all, or one that calls a
 * single held frame a slide.
 */

const slide = (positions: number[]): Slide => ({ section: "skills", positions });

/** What the built page actually measured, before and after the fix. */
const MEASURED_SLIDING = [20, 17.6, 14.5, 12.6, 9.9, 8.3, 5.1, 2.2, 0];
const MEASURED_ARRIVING = [20, 0];

describe("a reveal without the preference set", () => {
  it("passes the slide the page actually performs", () => {
    expect(failures(judgeOrdinary([slide(MEASURED_SLIDING)]))).toEqual([]);
  });

  it("rejects a page where nothing animates, which everything else would pass", () => {
    const [verdict] = judgeOrdinary([slide([0])]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("nothing here is animating");
  });

  it("rejects a reveal that never lands in place", () => {
    const [verdict] = judgeOrdinary([slide([20, 17, 14, 11, 8, 5, 3])]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("rather than in place");
  });

  it("needs more positions than a jump, by more than one", () => {
    expect(SLIDING).toBeGreaterThan(ARRIVING_AT_ONCE + 1);
  });
});

describe("a reveal for a visitor who asked for less motion", () => {
  it("passes the arrival the page actually performs", () => {
    expect(failures(judgeReduced([slide(MEASURED_ARRIVING)]))).toEqual([]);
  });

  it("passes one that never moves at all", () => {
    expect(failures(judgeReduced([slide([0])]))).toEqual([]);
  });

  it("rejects the slide the page performed before this was answered", () => {
    const [verdict] = judgeReduced([slide(MEASURED_SLIDING)]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("asked for reduced motion");
  });

  it("rejects one that is left where it started rather than arriving", () => {
    const [verdict] = judgeReduced([slide([20])]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("never arrives");
  });
});

describe("a section scrolled away from and back", () => {
  it("passes when it stays where it arrived", () => {
    expect(failures(judgeDoesNotReplay([{ section: "skills", positions: [0] }]))).toEqual([]);
  });

  it("rejects the replay that dropping viewport.once produces", () => {
    // Measured with `once` removed: it slid from 10.1 back to 0 on the way
    // back past it, and every other check in this repository stayed green.
    const [verdict] = judgeDoesNotReplay([
      { section: "skills", positions: [10.1, 11, 8.2, 4.1, 0.2, 0] },
    ]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("not set to run once");
    expect(verdict.problem).toContain("10.1");
  });
});

describe("reporting", () => {
  it("names every section that failed and no section that passed", () => {
    const verdicts = judgeReduced([
      { section: "skills", positions: MEASURED_ARRIVING },
      { section: "expertise", positions: MEASURED_SLIDING },
    ]);

    expect(failures(verdicts).map((v) => v.section)).toEqual(["expertise"]);
  });
});
