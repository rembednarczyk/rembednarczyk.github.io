import "@testing-library/jest-dom";
import { vi } from "vitest";

/**
 * jsdom implements none of these, and all are reached on the very first
 * render: motion uses IntersectionObserver for whileInView, matchMedia
 * backs the prefers-reduced-motion checks, and ResizeObserver watches the
 * consent banner so the page can reserve the space it covers. Without them
 * no component in this project can be rendered in a test at all.
 *
 * A stub that does nothing would hide what it stands in for, so the two
 * that carry behaviour are exercised directly: the consent banner's
 * reservation in src/hooks/useSpaceForFixedBar.test.ts, and the reveal in
 * scripts/runRevealMotion.ts, which needs a real browser.
 */

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  // Report elements as visible straight away, so whileInView content is
  // present rather than stuck in its hidden initial state.
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this,
    );
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

class MockResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", MockResizeObserver);

vi.stubGlobal(
  "matchMedia",
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);
