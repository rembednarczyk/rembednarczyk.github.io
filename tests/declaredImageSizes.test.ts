import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Sizes this repository states about its own images.
 *
 * A wrong number here is invisible from the code and visible to everyone
 * else. The banner at the top of the README declared 1200x475 for an image
 * that is 1200x630, so GitHub squashed it by a quarter on the repository's
 * front page — the first thing anyone sees — and nothing anywhere could
 * have reported it.
 *
 * The same argument is why the portrait's dimensions are checked in
 * tests/portrait.test.ts: a declared size that does not match the file
 * moves the page when the image lands. This covers the two places the
 * numbers are written for somebody else to read.
 */

const root = resolve(__dirname, "..");
const readme = readFileSync(resolve(root, "README.md"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");

/** Width and height out of a PNG's IHDR, which is always the first chunk. */
function pngSize(file: string): { width: number; height: number } {
  const data = readFileSync(file);

  expect(data.subarray(1, 4).toString("ascii"), `${file} is not a PNG`).toBe("PNG");
  expect(data.subarray(12, 16).toString("ascii"), "no IHDR chunk").toBe("IHDR");

  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

const ogImage = resolve(root, "public/img/og-image.png");

describe("the banner in the README", () => {
  const tag = /<img\s+width="(\d+)"\s+height="(\d+)"[^>]*src="([^"]+)"/.exec(readme);

  it("is declared at all, so the check below has something to read", () => {
    expect(tag, "the README no longer opens with an <img> carrying a size").not.toBeNull();
  });

  it("declares the size the file actually is", () => {
    const [, width, height, src] = tag!;

    // The README points at the deployed copy, which is the same file this
    // repository ships in public/.
    expect(src).toContain("/img/og-image.png");

    const actual = pngSize(ogImage);
    expect(
      { width: Number(width), height: Number(height) },
      "GitHub honours these attributes, so a wrong one distorts the banner",
    ).toEqual(actual);
  });
});

describe("what the page tells a platform about its preview image", () => {
  const meta = (property: string) =>
    new RegExp(`property="${property}"\\s+content="([^"]*)"`).exec(html)?.[1];

  it("declares width and height, and they match the file", () => {
    // Without these a platform has to fetch and measure the image before it
    // can lay the card out, and some fall back to the small card instead.
    const actual = pngSize(ogImage);

    expect(Number(meta("og:image:width"))).toBe(actual.width);
    expect(Number(meta("og:image:height"))).toBe(actual.height);
  });

  it("declares the type the file actually is", () => {
    expect(meta("og:image:type")).toBe("image/png");
  });

  it("describes the image for anyone who cannot see it", () => {
    const alt = meta("og:image:alt");

    expect(alt, "og:image:alt is missing").toBeTruthy();
    expect(alt!.length).toBeGreaterThan(20);
    expect(meta("twitter:image:alt")).toBe(alt);
  });

  it("points at an image that is in this repository", () => {
    const src = meta("og:image");

    expect(src).toContain("/img/og-image.png");
    expect(() => statSync(ogImage), "og-image.png is not in public/img").not.toThrow();
  });

  it("keeps the preview at the proportions the platforms crop to", () => {
    /**
     * 1200x630 is the size Open Graph recommends, and its ratio is 1.905 —
     * not the 1.91 that gets quoted, which is that number rounded. This
     * first asserted the quoted figure to two decimals and failed the
     * correct image by 0.005, so the tolerance describes the band a card
     * survives rather than a number I half-remembered.
     */
    const { width, height } = pngSize(ogImage);

    expect(width).toBeGreaterThanOrEqual(1200);
    expect(height).toBeGreaterThanOrEqual(630);
    expect(width / height).toBeGreaterThan(1.85);
    expect(width / height).toBeLessThan(1.95);
  });
});
