import { describe, expect, it } from "vitest";
import { isContentMessage, originAllowed } from "./protocol";
import { STATIC_RAW } from "../data/content";

/**
 * The two decisions the wire makes, tested without a DOM: whose messages are
 * heard, and what counts as content. Both are the preview's security — it
 * renders unsaved content and answers with the page's shape, so a message
 * from a page the owner did not open must be dropped, and a malformed one
 * must not be mistaken for content.
 */

describe("originAllowed", () => {
  it("allows the editor's dev origin", () => {
    expect(originAllowed("http://localhost:3001")).toBe(true);
  });

  it("refuses anywhere else", () => {
    expect(originAllowed("https://evil.example")).toBe(false);
    expect(originAllowed("null")).toBe(false);
    expect(originAllowed("")).toBe(false);
  });
});

describe("isContentMessage", () => {
  it("accepts a well-formed content message", () => {
    expect(isContentMessage({ type: "preview:content", content: STATIC_RAW })).toBe(true);
  });

  it("refuses the wrong envelope", () => {
    expect(isContentMessage({ type: "preview:geometry", content: STATIC_RAW })).toBe(false);
    expect(isContentMessage("preview:content")).toBe(false);
    expect(isContentMessage(null)).toBe(false);
  });

  it("refuses content missing a document the page needs", () => {
    // A page cannot be built from fifteen-minus-one, and half-content that
    // slipped through would throw deep in a section instead of here.
    const missingHero: Record<string, unknown> = { ...STATIC_RAW };
    delete missingHero["hero"];
    expect(isContentMessage({ type: "preview:content", content: missingHero })).toBe(false);
  });
});
