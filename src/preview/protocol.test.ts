import { describe, expect, it } from "vitest";
import {
  isContentMessage,
  looksLikeContent,
  normalizeOrigins,
  originAllowed,
} from "./protocol";
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

describe("normalizeOrigins", () => {
  it("reduces each entry to a bare origin, so a trailing slash still matches", () => {
    // The mistake that dropped every edit in silence: the editor's URL pasted
    // with the slash a browser shows. event.origin never has one, so the two
    // never matched. Normalising both sides removes the trap.
    expect(normalizeOrigins("https://x.onrender.com/")).toEqual(["https://x.onrender.com"]);
    expect(normalizeOrigins("https://x.onrender.com/preview")).toEqual(["https://x.onrender.com"]);
  });

  it("splits a comma-separated list and drops the blanks", () => {
    expect(normalizeOrigins("https://a.test, https://b.test ,")).toEqual([
      "https://a.test",
      "https://b.test",
    ]);
  });

  it("drops an unparseable value rather than crashing the wire", () => {
    // This runs for every preview message; a bad env value must not throw.
    expect(normalizeOrigins("not a url")).toEqual([]);
    expect(normalizeOrigins(undefined)).toEqual([]);
  });
});

describe("looksLikeContent", () => {
  it("is true for the content envelope, whatever else it holds", () => {
    expect(looksLikeContent({ type: "preview:content" })).toBe(true);
    expect(looksLikeContent({ type: "preview:content", content: {} })).toBe(true);
  });

  it("is false for anything else, so it warns only on a real attempt", () => {
    expect(looksLikeContent({ type: "preview:ready" })).toBe(false);
    expect(looksLikeContent("preview:content")).toBe(false);
    expect(looksLikeContent(null)).toBe(false);
    expect(looksLikeContent(undefined)).toBe(false);
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
