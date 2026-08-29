import { describe, expect, it } from "vitest";
import {
  PRINT_URL,
  isPrintRequest,
  withoutPrintRequest,
} from "./printRequest";

describe("the printed address", () => {
  /**
   * This one is on paper, on material already handed out. It cannot be
   * corrected after the fact, so the site has to keep answering it.
   */
  it("is the address the QR code carries", () => {
    expect(PRINT_URL).toBe("https://remigiuszbednarczyk.com/?print=true");
  });

  it("is itself a print request", () => {
    expect(isPrintRequest(new URL(PRINT_URL).search)).toBe(true);
  });

  it("lands on the root path, so it is not answered by the 404 page", () => {
    // The site decides between the page and the 404 view by pathname. A
    // printed link to any other path would reach a "Signal Lost" screen.
    expect(new URL(PRINT_URL).pathname).toBe("/");
  });
});

describe("isPrintRequest", () => {
  it.each(["?print=true", "?a=1&print=true", "?print=true&b=2"])(
    "accepts %s",
    (search) => expect(isPrintRequest(search)).toBe(true),
  );

  it.each([
    ["nothing at all", ""],
    ["a bare question mark", "?"],
    ["an unrelated parameter", "?utm_source=cv"],
    ["a false value", "?print=false"],
    ["an empty value", "?print="],
    ["the parameter with no value", "?print"],
    ["a longer value that starts the same", "?print=truthy"],
  ])("rejects %s", (_case, search) => {
    expect(isPrintRequest(search)).toBe(false);
  });

  /**
   * The reason this is parsed rather than searched. `includes("print=true")`
   * matches every one of these, so an unrelated parameter ending in the same
   * letters opened a print dialog on a visitor who never asked for one.
   */
  it.each(["?noprint=true", "?sprint=true", "?reprint=true", "?a=noprint=true"])(
    "rejects %s, which a substring match would have accepted",
    (search) => {
      expect(search.includes("print=true")).toBe(true);
      expect(isPrintRequest(search)).toBe(false);
    },
  );
});

describe("withoutPrintRequest", () => {
  it("removes the parameter", () => {
    expect(withoutPrintRequest("https://example.com/?print=true")).toBe(
      "https://example.com/",
    );
  });

  it("leaves no stray question mark behind", () => {
    // A trailing "?" in the address bar reads as a broken link.
    expect(withoutPrintRequest("https://example.com/?print=true")).not.toContain("?");
  });

  it("keeps the parameters that were not the print request", () => {
    expect(withoutPrintRequest("https://example.com/?utm=cv&print=true")).toBe(
      "https://example.com/?utm=cv",
    );
  });

  it("keeps the hash, which is how the page navigates between sections", () => {
    expect(withoutPrintRequest("https://example.com/?print=true#contact")).toBe(
      "https://example.com/#contact",
    );
  });

  it("leaves an address that never asked to print alone", () => {
    expect(withoutPrintRequest("https://example.com/?utm=cv")).toBe(
      "https://example.com/?utm=cv",
    );
  });
});
