import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { lastContentChange, resolveContentDate } from "../scripts/contentDate";
import { countLastmod, stampSitemap } from "../scripts/sitemap";

const sitemap = readFileSync(
  resolve(__dirname, "../public/sitemap.xml"),
  "utf8",
);

/**
 * Which day the stamp carries. The build date was right whenever a build
 * followed a content change and wrong for every other build — a code-only
 * deploy re-dated every page as if its words had moved — so the day now
 * comes from the last commit touching src/content, and from the clock only
 * when git cannot say.
 */
describe("the day the sitemap is dated", () => {
  const built = new Date("2031-07-04T12:00:00Z");

  it("is the day of the last content commit, as git names it", () => {
    // %cI carries the committer's zone; the day is theirs, not that instant
    // shifted into the build machine's zone.
    const stamped = stampSitemap(
      sitemap,
      resolveContentDate("2026-09-04T00:30:15+02:00", built),
    );

    expect(stamped).toContain("<lastmod>2026-09-04</lastmod>");
    expect(stamped).not.toContain("2031-07-04");
  });

  it("falls back to the build's day when git cannot say", () => {
    // No git, a shallow clone whose history stops short, an empty answer.
    for (const answer of [null, undefined, "", "   ", "fatal: not a git repository"]) {
      expect(resolveContentDate(answer, built).toISOString().slice(0, 10)).toBe("2031-07-04");
    }
  });

  it("reads a real day off this repository, so the fallback is not the only path", () => {
    // Under CI this is the whole point of fetch-depth: 0 in the workflow —
    // a shallow clone would answer null here and every build would carry
    // the build date under a different name.
    const answer = lastContentChange(resolve(__dirname, ".."));

    expect(answer).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

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
