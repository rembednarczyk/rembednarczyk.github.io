import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Portfolio } from "../App";
import { MotionProvider } from "../components/MotionProvider";
import { CVTemplate } from "../components/CVTemplate";

/**
 * A characterization suite for moving the content around.
 *
 * The data module holds the facts and the presentation in one file, and the
 * facts are about to be lifted out so a build step can read them without
 * pulling in JSX. Nothing about what the visitor reads should change, and
 * "should" is not a check: these record every word the page and the printed
 * CV render today, so the move is compared against the output rather than
 * against an intention.
 */

vi.mock("../components/ParticleBackground", () => ({
  ParticleBackground: () => null,
}));

/** Collapsed whitespace, so reflowed markup does not read as a content change. */
function textOf(container: HTMLElement): string {
  return (container.textContent ?? "").replace(/\s+/g, " ").trim();
}

/**
 * The three places the page prints a number it read off the clock.
 *
 * They were in the recorded text, which made the snapshot a function of the
 * day it ran as well as of the content. "12+ years of experience" becomes
 * thirteen on 1 January 2027 and the copyright year turns over every New
 * Year, so the suite was going to fail on a date with no change to the code
 * — and the obvious response to that failure, `vitest -u`, silently
 * re-records all 33 kB of page text, which is the one thing this snapshot
 * exists to prevent.
 *
 * Replaced rather than frozen, because freezing the clock would leave the
 * dependency in place and invisible: someone dropping the fake timers in a
 * later refactor would break nothing for months and then break a build on a
 * public holiday. Here the recorded text has no date in it to be wrong.
 *
 * What the numbers actually are is asserted where it belongs, against the
 * function that computes them, in portfolioFacts.test.ts and domain.test.ts.
 */
function withoutClockDerivedValues(text: string): string {
  return text
    .replace(/\d+\+ years of experience/g, "N+ years of experience")
    .replace(/\d+\+Years Experience/g, "N+Years Experience")
    .replace(/© \d{4}/g, "© YYYY");
}

afterEach(() => {
  vi.useRealTimers();
  // Deliberately not unstubAllGlobals: setupTests.ts installs
  // IntersectionObserver, ResizeObserver and matchMedia through
  // vi.stubGlobal, and clearing them here took the harness out from under
  // the page — "ResizeObserver is not defined", from a cleanup that had
  // nothing to clean.
});

describe("what the page renders", () => {
  it("says the same words as before the content was split", () => {
    const { container } = render(
      <MotionProvider>
        <Portfolio />
      </MotionProvider>,
    );

    expect(withoutClockDerivedValues(textOf(container))).toMatchSnapshot();
  });
});

describe("what the printed CV renders", () => {
  it("says the same words as before the content was split", () => {
    const { container } = render(<CVTemplate />);
    expect(withoutClockDerivedValues(textOf(container))).toMatchSnapshot();
  });
});

describe("the recorded text does not depend on the day it was recorded", () => {
  /**
   * The two values move on different schedules, which is why both are
   * exercised rather than one standing in for the other. The copyright year
   * is read at render; the years-of-experience figure is computed once when
   * the data module loads, so moving the clock only changes it after the
   * module is imported again.
   */
  async function pageTextOn(date: string): Promise<string> {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(date));
    vi.resetModules();

    const [{ Portfolio: FreshPortfolio }, { MotionProvider: FreshProvider }] =
      await Promise.all([import("../App"), import("../components/MotionProvider")]);

    const { container, unmount } = render(
      <FreshProvider>
        <FreshPortfolio />
      </FreshProvider>,
    );
    const text = textOf(container);
    unmount();
    vi.useRealTimers();

    return text;
  }

  it("renders different words five years apart, so the check below is not vacuous", async () => {
    const [now, later] = [await pageTextOn("2026-06-15"), await pageTextOn("2031-06-15")];

    expect(now).not.toEqual(later);
    expect(now).toContain("12+ years of experience");
    expect(later).toContain("17+ years of experience");
    expect(now).toContain("© 2026");
    expect(later).toContain("© 2031");
  });

  it("records the same words either way", async () => {
    const [now, later] = [await pageTextOn("2026-06-15"), await pageTextOn("2031-06-15")];

    expect(withoutClockDerivedValues(now)).toEqual(withoutClockDerivedValues(later));
  });
});

describe("withoutClockDerivedValues", () => {
  /**
   * Tested directly, because proving it through the page would need the page
   * to be wrong first. Each pattern is the shape the page actually prints.
   */
  it("takes out the years figure in both places it appears", () => {
    expect(
      withoutClockDerivedValues("with 13+ years of experience and 13+Years Experience"),
    ).toBe("with N+ years of experience and N+Years Experience");
  });

  it("takes out the copyright year", () => {
    expect(withoutClockDerivedValues("© 2031 Remigiusz Bednarczyk")).toBe(
      "© YYYY Remigiusz Bednarczyk",
    );
  });

  it("leaves every other number alone", () => {
    // The page is full of numbers that mean something: 500+ testers, the
    // ISTQB certificate ids, the job years. A normaliser that ate those
    // would take the content out of a content snapshot.
    const kept = "500+ Testers Trained, 2021 - Present, ID: 10262/FLCT/2018";

    expect(withoutClockDerivedValues(kept)).toBe(kept);
  });
});
