import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { describeError, firstFrame, reportError } from "./reportError";
import { CONSENT_STORAGE_KEY } from "../hooks/useCookieConsent";

/**
 * A real stack points at this test file, which says nothing about what a
 * deployed bundle produces. These are the two shapes that matter, copied
 * from the browsers that write them.
 */
const CHROME_STACK = [
  "TypeError: boom",
  "    at bl (https://remigiuszbednarczyk.com/assets/index-DeyIveWb.js:17:72594)",
  "    at Eo (https://remigiuszbednarczyk.com/assets/index-DeyIveWb.js:8:47507)",
].join("\n");

const FIREFOX_STACK = [
  "bl@https://remigiuszbednarczyk.com/assets/index-DeyIveWb.js:17:72594",
  "Eo@https://remigiuszbednarczyk.com/assets/index-DeyIveWb.js:8:47507",
].join("\n");

/** An error that carries the stack a browser would have given it. */
function thrownAt(stack: string | undefined, message = "boom"): TypeError {
  const error = new TypeError(message);
  Object.defineProperty(error, "stack", { value: stack, configurable: true });
  return error;
}

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

    reportError(thrownAt(CHROME_STACK), "particle-frame");

    expect(gtag).toHaveBeenCalledWith("event", "exception", {
      description:
        "particle-frame — TypeError: boom @ index-DeyIveWb.js:17:72594",
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

describe("the location", () => {
  /**
   * The point of publishing source maps. A minified position is useless on
   * its own and exact once a map is there to resolve it, so the report has
   * to carry one.
   */
  it("reads the innermost frame out of a Chrome stack", () => {
    expect(firstFrame(thrownAt(CHROME_STACK))).toBe("index-DeyIveWb.js:17:72594");
  });

  it("reads it out of a Firefox stack, which has no message line", () => {
    // Firefox starts at the first frame, so anything that skipped a line
    // would report the caller instead of the thrower.
    expect(firstFrame(thrownAt(FIREFOX_STACK))).toBe("index-DeyIveWb.js:17:72594");
  });

  it("leaves out the origin", () => {
    expect(firstFrame(thrownAt(CHROME_STACK))).not.toContain("remigiusz");
    expect(firstFrame(thrownAt(CHROME_STACK))).not.toContain("https");
  });

  it("is empty when there is no stack to read", () => {
    expect(firstFrame(thrownAt(undefined))).toBe("");
    expect(firstFrame("just a string")).toBe("");
  });

  it("is empty rather than quoting a message that looks like a frame", () => {
    expect(firstFrame(thrownAt("TypeError: boom"))).toBe("");
  });

  it("is capped, so it can never crowd out the message", () => {
    // A bundler, a browser extension or an inline module can produce a
    // frame far longer than a hashed asset name. Uncapped, the room left
    // for the message would go negative and the cut would land backwards.
    const long = `at f (https://x/${"n".repeat(300)}.js:1:1)`;
    const description = describeError(thrownAt(`Error: boom\n    ${long}`), "render");

    expect(firstFrame(thrownAt(`Error: boom\n    ${long}`))).toHaveLength(48);
    expect(description.length).toBeLessThanOrEqual(150);
    expect(description).toContain("render — TypeError: boom");
  });
});

describe("the description", () => {
  it("says where it happened and where it came from", () => {
    expect(
      describeError(thrownAt(CHROME_STACK, "x is undefined"), "particle-frame"),
    ).toBe("particle-frame — TypeError: x is undefined @ index-DeyIveWb.js:17:72594");
  });

  it("says only where it happened when there is no frame", () => {
    expect(describeError(thrownAt(undefined), "render")).toBe(
      "render — TypeError: boom",
    );
  });

  it("keeps a value that was thrown but is not an Error", () => {
    expect(describeError("just a string", "render")).toBe(
      "render — non-error thrown: just a string",
    );
  });

  it("cuts a long message here rather than letting the receiver cut it", () => {
    const description = describeError(thrownAt(undefined, "m".repeat(400)), "render");

    expect(description).toHaveLength(150);
    expect(description.endsWith("…")).toBe(true);
  });

  it("cuts the message rather than the location", () => {
    // The location is the half that cannot be guessed from anywhere else,
    // so a message long enough to crowd it out loses its own tail instead.
    const description = describeError(
      thrownAt(CHROME_STACK, "m".repeat(400)),
      "render",
    );

    expect(description).toHaveLength(150);
    expect(description.endsWith(" @ index-DeyIveWb.js:17:72594")).toBe(true);
    expect(description).toContain("…");
  });

  it("leaves a message that fits exactly as it is", () => {
    const message = "m".repeat(150 - "render — TypeError: ".length);
    const description = describeError(thrownAt(undefined, message), "render");

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
