import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import * as facts from "../src/data/portfolioFacts";
import { fillPlaceholders } from "../src/data/placeholders";

/**
 * The split is only worth having if it stays true.
 *
 * Every word the site states now lives in src/content as JSON, and
 * portfolioFacts.ts assembles it into the typed shapes the page and the
 * build read. That arrangement buys one thing: an editor outside this
 * repository can change what the site says by rewriting a JSON file. It
 * buys nothing at all the moment a sentence goes back into the TypeScript,
 * because then the editor shows a page it cannot fully change and nothing
 * says which half is which.
 *
 * Nothing in a type system can notice that. A string literal added to the
 * assembly layer compiles, renders, and passes every check this repository
 * had before this file: the content snapshot records the new sentence as
 * happily as an old one, since it is a characterization of the page and the
 * page did change on purpose.
 *
 * So the property is stated directly. The assembly layer is allowed to do
 * exactly two things to content — fill a placeholder, and join an array of
 * parts into one string — and every word it hands out has to be traceable
 * to a content file through one of them. It invents nothing.
 */

const root = resolve(__dirname, "..");
const contentDir = resolve(root, "src/content");

const contentFiles = readdirSync(contentDir).filter((entry) => entry.endsWith(".json"));

/** Everything in the content tree, as parsed JSON. */
const content = contentFiles.map(
  (file) => JSON.parse(readFileSync(resolve(contentDir, file), "utf8")) as unknown,
);

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    // Both the parts and what joining them produces, because that join is
    // the second of the two things the assembly layer is allowed to do:
    // a phone number's href is its parts run together.
    const joined = value.every((item) => typeof item === "string") ? [value.join("")] : [];
    return [...joined, ...value.flatMap(stringsIn)];
  }
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return [];
}

/**
 * What content is allowed to become. The same substitution the module
 * performs, applied here so a filled placeholder is not read as an invented
 * word — and only that substitution, so anything else still is.
 */
const VALUES = { yearsOfExperience: String(facts.yearsOfExperience) };
const offered = new Set(stringsIn(fillPlaceholders(content, VALUES)));

/** Everything the module hands to the page and to the build. */
const handedOut = stringsIn(Object.values(facts));

describe("the content tree", () => {
  it("has a file for each thing the site says, and the module reads them all", () => {
    const module = readFileSync(resolve(root, "src/data/portfolioFacts.ts"), "utf8");

    const unread = contentFiles.filter((file) => !module.includes(`../content/${file}`));

    expect(
      unread,
      `these are in src/content and portfolioFacts.ts imports none of them, so they ship to nobody and drift unnoticed:\n  ${unread.join("\n  ")}`,
    ).toEqual([]);
    expect(contentFiles.length).toBeGreaterThan(5);
  });

  it("is read as more than a handful of strings, so the check below is not vacuous", () => {
    // Measured: 253 distinct strings offered, 315 handed out. The numbers
    // are not the point — an empty haystack passing every containment
    // check is.
    expect(offered.size).toBeGreaterThan(200);
    expect(handedOut.length).toBeGreaterThan(200);
  });
});

describe("what the assembly layer hands out", () => {
  it("comes from a content file, every word of it", () => {
    const invented = [...new Set(handedOut)].filter((text) => !offered.has(text));

    expect(
      invented,
      `these are stated in src/data/portfolioFacts.ts and in no content file, so an editor rewriting the content cannot change them:\n  ${invented.map((text) => `"${text}"`).join("\n  ")}`,
    ).toEqual([]);
  });
});
