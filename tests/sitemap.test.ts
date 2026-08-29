import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { countLastmod, stampSitemap } from "../scripts/sitemap";

const sitemap = readFileSync(
  resolve(__dirname, "../public/sitemap.xml"),
  "utf8",
);

describe("sitemap stamping", () => {
  it("dates every entry from the build", () => {
    const stamped = stampSitemap(sitemap, new Date("2031-07-04T12:00:00Z"));

    expect(stamped).toContain("<lastmod>2031-07-04</lastmod>");
    expect(stamped).not.toContain("2026-08-29");
    expect(countLastmod(stamped)).toBe(countLastmod(sitemap));
  });

  it("leaves the rest of the document alone", () => {
    const stamped = stampSitemap(sitemap, new Date("2031-07-04T12:00:00Z"));

    expect(stamped).toContain("<loc>https://remigiuszbednarczyk.com/</loc>");
    expect(stamped).toContain("<loc>https://remigiuszbednarczyk.com/llm.txt</loc>");
  });

  it("is unchanged by a second pass", () => {
    const at = new Date("2031-07-04T12:00:00Z");
    expect(stampSitemap(stampSitemap(sitemap, at), at)).toBe(
      stampSitemap(sitemap, at),
    );
  });

  // Without an entry to rewrite the plugin does nothing, and the dates would
  // go back to being whatever someone last typed.
  it("has entries for the plugin to rewrite", () => {
    expect(countLastmod(sitemap)).toBeGreaterThan(0);
  });
});
