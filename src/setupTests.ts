import "@testing-library/jest-dom";
import { vi } from "vitest";

/**
 * jsdom implements neither of these, and both are reached on the very
 * first render: motion uses IntersectionObserver for whileInView, and
 * matchMedia backs the prefers-reduced-motion checks. Without them no
 * component in this project can be rendered in a test at all.
 */

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
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
