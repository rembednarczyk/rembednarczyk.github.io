import { afterEach, describe, expect, it } from "vitest";
import {
  MEASUREMENT_ID,
  TAG_ELEMENT_ID,
  TAG_SRC,
  loadAnalyticsTag,
} from "./analyticsTag";

/**
 * What the visitor's browser is allowed to ask Google for, and when.
 */

afterEach(() => {
  document.getElementById(TAG_ELEMENT_ID)?.remove();
});

const tags = () =>
  Array.from(document.querySelectorAll<HTMLScriptElement>("script[src]")).filter(
    (script) => script.src.includes("googletagmanager.com"),
  );

describe("loading the tag", () => {
  it("adds the script for the property index.html configures", () => {
    loadAnalyticsTag();

    expect(tags()).toHaveLength(1);
    expect(tags()[0].src).toBe(TAG_SRC);
    expect(TAG_SRC).toContain(MEASUREMENT_ID);
  });

  it("loads it asynchronously, so it cannot block the page", () => {
    loadAnalyticsTag();

    expect(tags()[0].async).toBe(true);
  });

  it("adds it once, however many times it is called", () => {
    // The hook runs this on every consent change and every remount. Two
    // script elements would mean two pageviews from one visit.
    loadAnalyticsTag();
    loadAnalyticsTag();
    loadAnalyticsTag();

    expect(tags()).toHaveLength(1);
  });

  it("does nothing where there is no document", () => {
    // The build renders this page to static HTML. Reaching for document
    // there would break the build rather than the page.
    const { document: real } = globalThis;

    try {
      // @ts-expect-error deliberately removing it for the duration
      delete globalThis.document;
      expect(() => loadAnalyticsTag()).not.toThrow();
    } finally {
      globalThis.document = real;
    }
  });
});
