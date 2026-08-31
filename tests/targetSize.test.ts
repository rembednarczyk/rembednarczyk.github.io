import { describe, expect, it } from "vitest";
import {
  DELIBERATELY_SMALL,
  ENHANCED,
  judgeTargetSize,
  staleExemptions,
  tooSmall,
  type Target,
} from "../scripts/targetSize";

/**
 * The half of the target-size gate that needs no browser.
 *
 * The measuring needs one — a tap area is a box after layout at a real
 * width, and no reading of Tailwind classes produces it — but what counts
 * as a failure is a decision, and decisions are cheap to hold here.
 */

const target = (over: Partial<Target> = {}): Target => ({
  label: "Accept",
  tag: "button",
  where: "375px",
  width: 60,
  height: 60,
  inline: false,
  ...over,
});

describe("what SC 2.5.5 asks for", () => {
  it("is the enhanced level, not the minimum", () => {
    // Recorded so it cannot drift to the AA number without somebody saying
    // so. The page holds itself to AAA on focus, and a page that is AAA for
    // the keyboard and AA for the thumb has picked its level by accident.
    expect(ENHANCED).toBe(44);
  });

  it("passes a target at exactly the bar", () => {
    expect(tooSmall(judgeTargetSize([target({ width: 44, height: 44 })]))).toEqual([]);
  });

  it("fails a target one pixel short on either side", () => {
    expect(tooSmall(judgeTargetSize([target({ width: 43, height: 44 })]))).toHaveLength(1);
    expect(tooSmall(judgeTargetSize([target({ width: 44, height: 43 })]))).toHaveLength(1);
  });

  it("names the size it found and the bar it missed", () => {
    const [problem] = tooSmall(judgeTargetSize([target({ width: 28, height: 28 })]));

    expect(problem.problem).toContain("28x28");
    expect(problem.problem).toContain("44x44");
    expect(problem.where).toBe("375px");
  });

  it("does not report a control laid out a hair under by arithmetic", () => {
    // A percentage width lands on 43.98 and that is not a target-size
    // failure, it is floating point. A gate reporting one gets argued with
    // rather than fixed, which is how a gate stops being read.
    expect(tooSmall(judgeTargetSize([target({ width: 43.98, height: 44 })]))).toEqual([]);
  });

  it("still reports one that is genuinely short of a whole pixel", () => {
    // The rounding above is a tenth, not a free half-pixel.
    expect(tooSmall(judgeTargetSize([target({ width: 43.4, height: 44 })]))).toHaveLength(1);
  });
});

describe("the exception for a link inside a sentence", () => {
  /**
   * SC 2.5.5 exempts a target "in a sentence or block of text", because
   * making a link in a paragraph 44px tall would wreck the paragraph. The
   * consent banner's "Read the privacy policy" is one, and it is the only
   * one this page has.
   */
  it("lets an inline target through at any size", () => {
    expect(
      tooSmall(judgeTargetSize([target({ inline: true, width: 145, height: 23 })])),
    ).toEqual([]);
  });

  it("does not let a small target through just for being small", () => {
    // The property that matters is being in a run of text, which the sweep
    // derives from the page. Without this pair, "inline" could quietly
    // become "anything that fails".
    expect(
      tooSmall(judgeTargetSize([target({ inline: false, width: 145, height: 23 })])),
    ).toHaveLength(1);
  });
});

describe("the exemption list", () => {
  it("is empty, and every entry that is ever added carries a reason", () => {
    // Not decoration: the type admits only a label and a reason, so an
    // exemption cannot be added without writing one. It is empty today
    // because every target on the page clears the bar.
    for (const [label, reason] of Object.entries(DELIBERATELY_SMALL)) {
      expect(reason.length, `${label} is exempt and says nothing about why`).toBeGreaterThan(20);
    }

    expect(Object.keys(DELIBERATELY_SMALL)).toEqual([]);
  });

  it("reports an entry the page no longer has", () => {
    // A list that can only be added to is a list that grows. Tested against
    // a list passed in rather than the real one, which is empty: asserting
    // on the empty list would have passed whatever this function did.
    const pretend = { "Old Button": "it was 20px tall and nobody could reach it" };

    expect(staleExemptions([target({ label: "Accept" })], pretend)).toEqual(["Old Button"]);
    expect(staleExemptions([target({ label: "Old Button" })], pretend)).toEqual([]);
  });

  it("honours an exemption while the target is still there", () => {
    const pretend = { Accept: "a reason long enough to be a reason" };

    expect(
      tooSmall(judgeTargetSize([target({ width: 20, height: 20 })], pretend)),
    ).toEqual([]);
    expect(tooSmall(judgeTargetSize([target({ width: 20, height: 20 })], {}))).toHaveLength(1);
  });
});
