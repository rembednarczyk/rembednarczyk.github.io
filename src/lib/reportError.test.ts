import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { describeError, reportError } from "./reportError";
import { CONSENT_STORAGE_KEY } from "../hooks/useCookieConsent";

/**
 * The site had no way of learning that it had failed for somebody. These
 * tests hold the two halves of fixing that: the report goes out, and it
 * goes out only when the visitor said it could.
 */

let gtag: ReturnType<typeof vi.fn<(...args: unknown[]) => void>>;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  gtag = vi.fn<(...args: unknown[]) => void>();
  window.gtag = gtag;
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete window.gtag;
  localStorage.clear();
});

describe("consent", () => {
  it("reports the failure once the visitor has granted it", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");

    reportError(new TypeError("boom"), "particle-frame");

    expect(gtag).toHaveBeenCalledWith("event", "exception", {
      description: "particle-frame — TypeError: boom",
      fatal: false,
    });
  });

  it("sends nothing when consent was refused", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "denied");

    reportError(new Error("boom"), "render");

    expect(gtag).not.toHaveBeenCalled();
  });

  it("sends nothing before the visitor has answered", () => {
    // The banner is still up. Silence is not a yes.
    reportError(new Error("boom"), "render");

    expect(gtag).not.toHaveBeenCalled();
  });

  it("logs to the console either way, because that never leaves the machine", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
    const error = new Error("boom");

    reportError(error, "render");

    expect(console.error).toHaveBeenCalledWith("render", error);
  });
});

describe("when reporting itself goes wrong", () => {
  it("survives the tag not being on the page", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    delete window.gtag;

    expect(() => reportError(new Error("boom"), "render")).not.toThrow();
  });

  it("survives the tag throwing", () => {
    // A blocker can replace gtag with something that does not behave. The
    // page is already handling one failure; this must not become a second.
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    window.gtag = () => {
      throw new Error("blocked");
    };

    expect(() => reportError(new Error("boom"), "render")).not.toThrow();
  });

  it("survives storage being unreadable", () => {
    // Private mode and blocked site data both throw on read. Consent is
    // then unknown, so nothing is sent.
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(() => reportError(new Error("boom"), "render")).not.toThrow();
    expect(gtag).not.toHaveBeenCalled();
  });
});

describe("the description", () => {
  it("says where it happened, so a minified stack is not needed", () => {
    expect(describeError(new TypeError("x is undefined"), "particle-frame")).toBe(
      "particle-frame — TypeError: x is undefined",
    );
  });

  it("keeps a value that was thrown but is not an Error", () => {
    expect(describeError("just a string", "render")).toBe(
      "render — non-error thrown: just a string",
    );
  });

  it("cuts a long message here rather than letting the receiver cut it", () => {
    const description = describeError(new Error("m".repeat(400)), "render");

    expect(description).toHaveLength(150);
    expect(description.endsWith("…")).toBe(true);
  });

  it("leaves a message that fits exactly as it is", () => {
    const message = "m".repeat(150 - "render — Error: ".length);
    const description = describeError(new Error(message), "render");

    expect(description).toHaveLength(150);
    expect(description).not.toContain("…");
  });
});

describe("severity", () => {
  it("marks a render failure fatal and a frame failure not", () => {
    // GA separates the two, and so should we: one took the page down.
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");

    reportError(new Error("boom"), "render", { fatal: true });
    reportError(new Error("boom"), "particle-frame");

    expect(gtag.mock.calls[0][2]).toMatchObject({ fatal: true });
    expect(gtag.mock.calls[1][2]).toMatchObject({ fatal: false });
  });
});
