import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { cvData } from "../src/data/portfolioFacts";
import { PRINT_URL } from "../src/lib/printRequest";

/**
 * The address this site claims to live at, in the eight places it is typed.
 *
 * They were eight independent copies of one string with nothing holding them
 * together: the page's own data, the print URL, `index.html`'s canonical and
 * its four social tags, `sitemap.xml`, `robots.txt`, `llm.txt` and `CNAME`.
 * A domain that moves takes some of them and leaves the rest pointing at an
 * address nobody owns, which is the class of defect nothing on a screen shows.
 *
 * `CNAME` is the one that stopped being ordinary. This repository used to be
 * named `<owner>.github.io`, which GitHub Pages serves as a user site from
 * the root; it is named for the domain now, which Pages serves as a project
 * site from `/<repository>/` unless a custom domain says otherwise. `CNAME`
 * is what says otherwise, `vite.config.ts` sets no `base`, and every asset
 * URL the build writes is absolute from `/`. So losing that one file no
 * longer means losing a nicety — it means every asset 404s under a path the
 * build has never heard of.
 *
 * Before the rename that file could have gone and the site would have kept
 * working. Nothing had to change for it to become load-bearing, which is
 * exactly why a check is worth more here than remembering.
 */

const root = resolve(__dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

/**
 * What the page says its own address is.
 *
 * The source of truth is the data the page renders rather than the config
 * that deploys it: it is the copy a visitor reads, and the one the rendered
 * content snapshot already holds.
 */
const domain = cvData.header.website;

describe("the address this site says it lives at", () => {
  it("is a bare host, which is the form CNAME needs", () => {
    // Guards the source of truth itself. A scheme or a trailing slash here
    // would be wrong in CNAME and would quietly make every check below
    // compare the same mistake against itself.
    expect(domain).toMatch(/^[a-z0-9.-]+\.[a-z]{2,}$/);
  });

  it("is what CNAME hands to GitHub Pages, exactly", () => {
    // Verbatim: Pages reads the file's contents as the domain, so a comment,
    // a scheme or a second line is not a tidier version of it.
    expect(read("public/CNAME").trim()).toBe(domain);
    expect(read("public/CNAME").trim().split("\n")).toHaveLength(1);
  });

  it("is the host every absolute link to ourselves uses", () => {
    const surfaces = [
      "index.html",
      "public/sitemap.xml",
      "public/robots.txt",
      "public/llm.txt",
    ];

    const wrong: string[] = [];
    let found = 0;

    for (const file of surfaces) {
      // Only our own links. A URL to LinkedIn or to a schema vocabulary is
      // somebody else's host and is not this check's business.
      for (const [, host] of read(file).matchAll(/https?:\/\/([a-z0-9.-]*bednarczyk[a-z0-9.-]*)/gi)) {
        found += 1;
        if (host !== domain) wrong.push(`${file}: ${host}`);
      }
    }

    // The site names itself on every one of those four surfaces, so a count
    // this low means the matching stopped working rather than that the links
    // went away.
    expect(found).toBeGreaterThan(6);
    expect(
      wrong,
      `these point at a host the site does not claim as its own:\n  ${wrong.join("\n  ")}`,
    ).toEqual([]);
  });

  it("is the host the printed QR code sends people to", () => {
    // That address is on material this site does not control and cannot
    // recall, so it is the one copy that cannot be corrected after the fact.
    expect(new URL(PRINT_URL).host).toBe(domain);
  });
});
