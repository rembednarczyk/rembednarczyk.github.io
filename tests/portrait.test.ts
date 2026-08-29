import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { aboutData } from "../src/data/portfolioFacts";

/**
 * The portrait is the heaviest thing the site sends, and it is the one asset
 * whose defects are invisible from the code: a file four times larger than
 * it needs to be looks exactly like a correct one, and so does a declared
 * size that does not match it.
 *
 * Both were true here. The photo was 2008x3119 and 482 kB for a box at most
 * 600px tall, fetched from an absolute URL on the live site, and declared as
 * 600x600 against a portrait, which moved the page by 0.0223 CLS when it
 * arrived.
 */

const root = resolve(__dirname, "..");
const path = resolve(root, "public", aboutData.imageUrl.replace(/^\//, ""));

/** Reads the intrinsic size out of the WebP container itself. */
function webpSize(file: string): { width: number; height: number } {
  const d = readFileSync(file);
  expect(d.subarray(0, 4).toString("ascii"), "not a RIFF file").toBe("RIFF");
  expect(d.subarray(8, 12).toString("ascii"), "not a WebP file").toBe("WEBP");

  const chunk = d.subarray(12, 16).toString("ascii");

  if (chunk === "VP8X") {
    return {
      width: d.readUIntLE(24, 3) + 1,
      height: d.readUIntLE(27, 3) + 1,
    };
  }

  if (chunk === "VP8 ") {
    return {
      width: d.readUInt16LE(26) & 0x3fff,
      height: d.readUInt16LE(28) & 0x3fff,
    };
  }

  throw new Error(`unhandled WebP chunk "${chunk}"`);
}

describe("the portrait", () => {
  it("is served from this deploy rather than another origin", () => {
    // An absolute URL to the live site meant dev, a preview build and
    // Storybook all showed whatever production happened to hold, so a
    // replaced photo could not be seen before it was replaced for everyone.
    expect(aboutData.imageUrl).toMatch(/^\//);
    expect(aboutData.imageUrl).not.toMatch(/^https?:/);
  });

  it("exists where the page asks for it", () => {
    expect(() => statSync(path), `${aboutData.imageUrl} is not in public/`).not.toThrow();
  });

  it("declares the size the file actually is", () => {
    // The browser reserves space from these before the image arrives. A
    // ratio that does not match the file moves everything below it.
    const actual = webpSize(path);

    expect(aboutData.imageWidth).toBe(actual.width);
    expect(aboutData.imageHeight).toBe(actual.height);
  });

  it("is not larger than the page can use", () => {
    // The box is at most 600px tall, so 1200 covers a 2x display. Anything
    // beyond that is downloaded and thrown away.
    const { height } = webpSize(path);

    expect(height).toBeGreaterThanOrEqual(1000);
    expect(height, "taller than a 2x display can use").toBeLessThanOrEqual(1400);
  });

  it("weighs less than the page's own JavaScript", () => {
    // It used to be 482 kB against a 378 kB bundle: the largest single
    // download on the site was a photograph.
    const kb = statSync(path).size / 1024;

    expect(kb).toBeLessThan(150);
  });
});
