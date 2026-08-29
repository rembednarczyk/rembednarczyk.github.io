import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useScrollLock, scrollLockHolders } from "./useScrollLock";

/**
 * The counting is the whole point. Before this hook existed, each dialog
 * managed `document.body.style.overflow` itself, so whichever cleanup ran
 * last decided for the page: closing one overlay released the lock another
 * still needed. Every test below fails against that arrangement.
 */

beforeEach(() => {
  document.body.style.overflow = "";
});

afterEach(() => {
  expect(scrollLockHolders()).toBe(0);
});

describe("useScrollLock", () => {
  it("does nothing while inactive", () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe("");
  });

  it("holds the page still while active", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
  });

  it("releases on unmount", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("releases when it stops being active", () => {
    const { rerender, unmount } = renderHook(
      ({ active }) => useScrollLock(active),
      { initialProps: { active: true } },
    );

    expect(document.body.style.overflow).toBe("hidden");
    rerender({ active: false });
    expect(document.body.style.overflow).toBe("");
    unmount();
  });

  // The case the split was made for.
  it("keeps the lock while a second holder still needs it", () => {
    const first = renderHook(() => useScrollLock(true));
    const second = renderHook(() => useScrollLock(true));

    expect(scrollLockHolders()).toBe(2);

    first.unmount();
    expect(document.body.style.overflow).toBe("hidden");

    second.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores whatever overflow was there before, not a guess", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });
});
