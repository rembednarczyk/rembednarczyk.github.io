import { describe, expect, it } from "vitest";
import {
  ENOUGH_IN_PAGE_COLOUR,
  PAINTS_ITS_OWN_COLOUR,
  PAINTS_SOMETHING,
  failures,
  firstRepeat,
  judgeFocus,
  type Stop,
} from "../scripts/focusIndicator";

/**
 * The browser half of this gate needs a browser. This is the half that
 * decides what the pixels mean, and the half where the sweep itself can go
 * wrong quietly — a walk that stops after three stops still reports three
 * passes.
 */

describe("what counts as showing keyboard focus", () => {
  it("passes the smallest indicator actually on the page", () => {
    // 287 pixels: a 24px icon link on a project card, the tightest ring
    // measured on the built page.
    expect(
      failures(judgeFocus([{ name: "a project link", painted: 287, inPageColour: 210 }])),
    ).toEqual([]);
  });

  it("fails a control that paints nothing", () => {
    const [verdict] = judgeFocus([{ name: "a new button", painted: 0, inPageColour: 0 }]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("cannot see where they are");
  });

  it("fails a control that could not be measured, rather than passing it", () => {
    // A control with no box on screen is the case where a check like this
    // quietly turns into no check at all.
    const [verdict] = judgeFocus([
      { name: "the skip link", painted: 0, inPageColour: 0, unmeasured: true },
    ]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("nothing could be measured");
  });

  it("sets the threshold well below the smallest real indicator", () => {
    expect(PAINTS_SOMETHING).toBeLessThan(287);
    expect(PAINTS_SOMETHING).toBeGreaterThan(0);
  });

  it("fails the browser's own ring, which paints plenty and none of it cyan", () => {
    // This is the defect the first version of the gate missed: with
    // focus-ring stripped from every project link, all twenty-eight stops
    // still painted, because Chrome draws a ring where the page draws none.
    const [verdict] = judgeFocus([
      { name: "Link to a project", painted: 372, inPageColour: 0 },
    ]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("missing focus-ring");
  });

  it("allows the one control whose indicator is deliberately not cyan", () => {
    // The skip link turns cyan when focused; its ring is white so it shows.
    expect(PAINTS_ITS_OWN_COLOUR).toEqual(["Skip to main content"]);
    expect(
      failures(
        judgeFocus([{ name: "Skip to main content", painted: 8356, inPageColour: 0 }]),
      ),
    ).toEqual([]);
  });

  it("lets no other control claim that exception", () => {
    const [verdict] = judgeFocus([
      { name: "Skip to main content ", painted: 400, inPageColour: 0 },
    ]);

    expect(verdict.ok, "the name has to match exactly").toBe(false);
    expect(ENOUGH_IN_PAGE_COLOUR).toBeGreaterThan(0);
  });

  it("names every control that failed and no control that passed", () => {
    const stops: Stop[] = [
      { name: "Accept", painted: 432, inPageColour: 300 },
      { name: "a new button", painted: 0, inPageColour: 0 },
      { name: "Decline", painted: 452, inPageColour: 310 },
    ];

    expect(failures(judgeFocus(stops)).map((v) => v.name)).toEqual(["a new button"]);
  });
});

describe("walking the tab order", () => {
  /**
   * Three sweeps of this page were written and three stopped early, each on
   * a different key: a label (two project links share one, stopping at 13 of
   * 29), a markup prefix (the nav buttons share one, stopping at 3), and an
   * element's identity, which is the one that works.
   */
  it("finds where a walk starts going round again", () => {
    expect(firstRepeat(["a", "b", "c", "a"])).toBe(3);
  });

  it("reports no repeat when every stop is its own", () => {
    expect(firstRepeat(["a", "b", "c"])).toBe(-1);
  });

  it("would have stopped a label-keyed walk at the first shared name", () => {
    const labels = ["Skip", "About", "Link to ISTQB", "Link to ISTQB", "Say Hello"];
    expect(firstRepeat(labels)).toBe(3);

    const ids = ["1", "2", "3", "4", "5"];
    expect(firstRepeat(ids)).toBe(-1);
  });
});
