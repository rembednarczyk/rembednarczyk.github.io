import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useSpaceForFixedBar } from "./useSpaceForFixedBar";

/**
 * A banner pinned to the foot of the viewport hides whatever the browser
 * scrolls under it, and the browser has no idea it is there. Two of
 * twenty-six keyboard stops landed entirely behind the consent banner at
 * the moment they took focus — WCAG 2.2 SC 2.4.11.
 *
 * jsdom has no ResizeObserver, so setupTests.ts stubs it. That stub would
 * hide this hook entirely if nothing exercised it, which is what these do.
 */

const barOfHeight = (height: number) => {
  const ref = createRef<HTMLElement>();
  const element = document.createElement("div");
  element.getBoundingClientRect = () => ({ height }) as DOMRect;
  (ref as { current: HTMLElement | null }).current = element;
  return ref;
};

const reserved = () => document.documentElement.style.scrollPaddingBottom;
const grown = () => document.body.style.paddingBottom;

afterEach(() => {
  document.documentElement.style.removeProperty("scroll-padding-bottom");
  document.body.style.removeProperty("padding-bottom");
});

describe("reserving the space a fixed bar covers", () => {
  it("reserves the bar's own height while it is showing", () => {
    renderHook(() => useSpaceForFixedBar(barOfHeight(110), true));

    expect(reserved()).toBe("110px");
  });

  it("also grows the page, so the end of it has somewhere to scroll to", () => {
    // scroll-padding alone left the footer's privacy link entirely behind
    // the banner: it is the last thing in the document, so there was no
    // further to scroll.
    renderHook(() => useSpaceForFixedBar(barOfHeight(110), true));

    expect(grown()).toBe("110px");
  });

  it("reserves nothing while it is not", () => {
    renderHook(() => useSpaceForFixedBar(barOfHeight(110), false));

    expect(reserved()).toBe("");
    expect(grown()).toBe("");
  });

  it("gives the space back when the bar goes away", () => {
    const ref = barOfHeight(110);
    const { rerender } = renderHook(
      ({ active }) => useSpaceForFixedBar(ref, active),
      { initialProps: { active: true } },
    );
    expect(reserved()).toBe("110px");

    rerender({ active: false });
    expect(reserved(), "the page keeps a gap it no longer needs").toBe("");
    expect(grown(), "the page stays taller than it needs to be").toBe("");
  });

  it("gives the space back when the component unmounts", () => {
    const { unmount } = renderHook(() =>
      useSpaceForFixedBar(barOfHeight(181), true),
    );
    expect(reserved()).toBe("181px");

    unmount();
    expect(reserved()).toBe("");
    expect(grown()).toBe("");
  });

  it("rounds up, so a fractional height never leaves the bar peeking", () => {
    renderHook(() => useSpaceForFixedBar(barOfHeight(87.4), true));

    expect(reserved()).toBe("88px");
  });

  it("does nothing when there is no bar to measure", () => {
    const empty = createRef<HTMLElement>();

    expect(() =>
      renderHook(() => useSpaceForFixedBar(empty, true)),
    ).not.toThrow();
    expect(reserved()).toBe("");
  });
});
