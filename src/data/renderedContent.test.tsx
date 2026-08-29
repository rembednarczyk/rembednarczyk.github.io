import { render } from "@testing-library/react";
import { LazyMotion, domAnimation } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import { Portfolio } from "../App";
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

describe("what the page renders", () => {
  it("says the same words as before the content was split", () => {
    const { container } = render(
      <LazyMotion features={domAnimation} strict>
        <Portfolio />
      </LazyMotion>,
    );

    expect(textOf(container)).toMatchSnapshot();
  });
});

describe("what the printed CV renders", () => {
  it("says the same words as before the content was split", () => {
    const { container } = render(<CVTemplate />);
    expect(textOf(container)).toMatchSnapshot();
  });
});
