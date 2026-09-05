import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ACCENTS, ICONS, accentOf, iconOf } from "../src/data/icons";
import { OFFERED_ACCENTS, OFFERED_ICONS } from "../src/data/vocabulary";

/**
 * An icon stopped being a symbol and became a string, and a string reaches
 * no type system.
 *
 * While a card was written as `<Terminal size={24} />`, a wrong icon was a
 * compile error and an unused import was a lint error. Now the card says
 * `"icon": "Terminal"` in a JSON file, so both of those went away at once:
 * a misspelt name is a card with a hole where its icon was, and an icon no
 * card asks for is a lucide component in the bundle for nobody.
 *
 * Both directions, because they fail differently and neither is visible.
 * The first is caught at load by a throw — chosen over a placeholder icon
 * because a page that renders wrong is a page nobody re-reads. The second
 * is caught here, since nothing else can see it: the import is used, by the
 * registry, which is exactly what makes it invisible to lint.
 *
 * The registry earned its throw on its first run. The project card imported
 * `Code2`, a deprecated alias whose canonical name is `CodeXml`, so the two
 * names for one icon disagreed the moment the icon became a string — and
 * every text check, the 33 kB content snapshot included, stayed green,
 * because an icon is not text.
 */

const root = resolve(__dirname, "..");
const contentDir = resolve(root, "src/content");

const content = readdirSync(contentDir)
  .filter((entry) => entry.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(resolve(contentDir, file), "utf8")) as unknown);

/** Every value content gives under a named key, wherever it is nested. */
function valuesUnder(key: string, value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => valuesUnder(key, item));
  if (value === null || typeof value !== "object") return [];

  return Object.entries(value).flatMap(([name, item]) =>
    name === key && typeof item === "string" ? [item] : valuesUnder(key, item),
  );
}

const named = [...new Set(content.flatMap((file) => valuesUnder("icon", file)))];
const accents = [...new Set(content.flatMap((file) => valuesUnder("accent", file)))];

describe("the icons content names", () => {
  it("finds icon names to check, so nothing below passes vacuously", () => {
    // Measured: 15 distinct icons across the six card files.
    expect(named.length).toBeGreaterThan(10);
  });

  it("every one of them resolves", () => {
    const missing = named.filter((name) => !(name in ICONS));

    expect(
      missing,
      `content names these and src/data/icons.ts does not offer them, so each is a card with no icon:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("leaves no icon in the registry that no card asks for and nobody put on offer", () => {
    // Invisible to lint and to both reachability ratchets: the import *is*
    // used — by the registry — which is the whole reason it needs saying
    // here. A lucide icon is roughly 400 bytes in the bundle for nobody.
    // The one licence is OFFERED_ICONS: a name the editor may offer before
    // a card wears it, chosen and listed as such, not merely left behind.
    const unused = Object.keys(ICONS).filter(
      (name) => !named.includes(name) && !(OFFERED_ICONS as readonly string[]).includes(name),
    );

    expect(
      unused,
      `these are imported and registered, no content file names them and they are not on offer:\n  ${unused.join("\n  ")}`,
    ).toEqual([]);
  });

  it("takes an icon off the offer once a card wears it, so the offer stays what it says", () => {
    const taken = OFFERED_ICONS.filter((name) => named.includes(name));

    expect(
      taken,
      `content names these now, so they belong in ICON_NAMES proper, not OFFERED_ICONS:\n  ${taken.join("\n  ")}`,
    ).toEqual([]);
  });
});

describe("the accents content asks for", () => {
  it("finds accents to check", () => {
    expect(accents.length).toBeGreaterThan(2);
  });

  it("every one of them resolves, and none is spare but the offer", () => {
    // `accent` is read out of every content file rather than the three
    // that carry it today, so a fourth card type adopting accents is
    // covered by this without anyone remembering to add it.
    //
    // It is called `accent` and not `tone` because this check found the
    // collision: an award's `tone` is one of gold, cyan and purple and an
    // icon's accent is one of cyan, purple, emerald and orange — two
    // vocabularies under one key, which reads as a single palette to
    // anything building a form from the content, and would have offered
    // the wrong four colours in three of the places it appears.
    //
    // The offer is the one licence, as for icons: an accent on offer to the
    // editor that no card wears yet, listed as such, and taken off the list
    // once a card wears it.
    expect(accents.filter((tone) => !(tone in ACCENTS))).toEqual([]);
    expect(
      Object.keys(ACCENTS)
        .filter((tone) => !accents.includes(tone))
        .sort(),
    ).toEqual([...OFFERED_ACCENTS].sort());
    expect(OFFERED_ACCENTS.filter((tone) => accents.includes(tone))).toEqual([]);
  });
});

describe("a name nothing offers", () => {
  it("throws for an icon rather than rendering a hole", () => {
    expect(() => iconOf("Terminator")).toThrow(/Terminator/);
  });

  it("throws for an accent rather than rendering a card with no colour", () => {
    expect(() => accentOf("chartreuse")).toThrow(/chartreuse/);
  });

  it("says what it could have given instead", () => {
    expect(() => iconOf("Terminator")).toThrow(/Terminal/);
    expect(() => accentOf("chartreuse")).toThrow(/emerald/);
  });
});
