import { describe, expect, it } from "vitest";
import {
  ANY_OF_IT,
  ENOUGH_IN_PAGE_COLOUR,
  ENTIRELY,
  PAINTS_ITS_OWN_COLOUR,
  PAINTS_SOMETHING,
  failures,
  firstRepeat,
  judgeFocus,
  judgeNotObscured,
  type Overlaid,
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

describe("what the consent banner does to the controls behind it", () => {
  const clear = (over: Partial<Overlaid> = {}): Overlaid => ({
    name: "a control",
    coveredByCard: 0,
    clickReaches: true,
    blockedBy: "",
    ...over,
  });

  it("passes a control the banner leaves alone", () => {
    expect(failures(judgeNotObscured([clear()]))).toEqual([]);
  });

  it("fails one entirely behind the banner when it takes focus", () => {
    // Measured before the fix: the contact button and the footer's privacy
    // link, at 1280x900.
    const [verdict] = judgeNotObscured([
      clear({
        name: "Get in Touch",
        coveredByCard: 1,
        clickReaches: false,
        blockedBy: "the consent banner",
        inFrontWhereCovered: false,
      }),
    ]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("SC 2.4.11");
  });

  it("fails one the banner only half covers, because this page holds to AAA", () => {
    // SC 2.4.11 would allow this: it fails on entirely hidden. SC 2.4.12
    // fails on any of it hidden, and 47% was what was left after the first
    // round of fixes — the reservation stopped at the card's top edge
    // instead of the band's.
    const [verdict] = judgeNotObscured([
      clear({ coveredByCard: 0.47, inFrontWhereCovered: false }),
    ]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("SC 2.4.12");
    expect(verdict.problem).toContain("47%");
  });

  it("passes a rounding artefact, which is not something anyone can see", () => {
    // Two rects meeting exactly produce a sliver. The real failures were
    // 7%, 47% and 100%.
    expect(
      failures(judgeNotObscured([clear({ coveredByCard: 0.004, inFrontWhereCovered: false })])),
    ).toEqual([]);
  });

  it("fails one the banner swallows the click for, however visible it looks", () => {
    // Two project links were in this state: the card covered none of them,
    // and the band's transparent strip took the click anyway.
    const [verdict] = judgeNotObscured([
      clear({ name: "Link to a project", coveredByCard: 0, clickReaches: false, blockedBy: "the consent banner" }),
    ]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("wider than its card");
  });

  it("fails one of the banner's own controls that something else covers", () => {
    // The scroll-to-top button took the right third of Accept at 768px and
    // left its middle clickable, so a centre-only test called it fine.
    const [verdict] = judgeNotObscured([
      clear({
        name: "Accept",
        clickReaches: false,
        blockedBy: "Scroll to top",
        partOfTheBanner: true,
        failedAt: 0.7,
      }),
    ]);

    expect(verdict.ok).toBe(false);
    expect(verdict.problem).toContain("70% across it");
    expect(verdict.problem).toContain("Scroll to top");
  });

  it("does not call a control obscured when it is the one doing the obscuring", () => {
    // Geometry said the scroll-to-top button was entirely behind the card.
    // It was painting over it. Only the hit test tells them apart.
    expect(
      failures(
        judgeNotObscured([
          clear({
            name: "Scroll to top",
            coveredByCard: 1,
            clickReaches: true,
            inFrontWhereCovered: true,
          }),
        ]),
      ),
    ).toEqual([]);
  });

  it("treats anything short of complete as not entirely hidden", () => {
    expect(ENTIRELY).toBeLessThan(1);
    expect(ENTIRELY).toBeGreaterThan(0.99);
  });

  it("sets the AAA threshold well below the smallest real overlap", () => {
    // The smallest that mattered was 7%.
    expect(ANY_OF_IT).toBeLessThan(0.07);
    expect(ANY_OF_IT).toBeGreaterThan(0);
  });
});
