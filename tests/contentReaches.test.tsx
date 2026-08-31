import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Portfolio } from "../src/App";
import { CVTemplate } from "../src/components/CVTemplate";
import { MotionProvider } from "../src/components/MotionProvider";
import { fillPlaceholders } from "../src/data/placeholders";
import { yearsOfExperience } from "../src/data/portfolioFacts";

/**
 * Every word in src/content reaches a reader.
 *
 * This replaces a characterization snapshot of all 33 kB of page text,
 * which did its job across two content migrations and then became the one
 * thing standing between this repository and the editor it was migrating
 * for. Measured: changing a single word of one quote in src/content turned
 * the suite red, because the snapshot records the page and the editor's
 * entire purpose is to change the page. An editor that cannot commit
 * without also re-rendering the page in a test runner is not an editor.
 *
 * So the invariant is restated as a property rather than a recording. It
 * holds under any edit an owner makes and fails on the thing the snapshot
 * was really there to catch: content that stops arriving. Both directions
 * of the CMS bargain are checks now — tests/contentBoundary.test.ts says
 * the page invents nothing that content does not offer, and this says the
 * page drops nothing that content does offer.
 *
 * It is also the guarantee the editor needs most, stated where it can be
 * enforced: *if you write it, it shows up*. A component rendering three of
 * four paragraphs is silent on the page and loud here.
 *
 * What went with the snapshot, and is not pretended otherwise: the wording
 * and the order of the prose still written into components — section
 * headings, button labels, the consent banner. Nothing holds those to
 * anything now. They are the same strings the README names as the last
 * un-migrated content, and the reason this file does not try to cover them
 * is that striking content out of the page text to leave a remainder was
 * measured and does not work: short entries like the two- and
 * three-letter tags match inside longer sentences and shred what is left into 255 fragments.
 */

vi.mock("../src/components/ParticleBackground", () => ({ ParticleBackground: () => null }));

const contentDir = resolve(__dirname, "../src/content");

/**
 * Keys whose value is not text a visitor reads: the name of the shape a
 * band draws, the anchor the navigation scrolls to, an icon's name, an
 * accent's, a link's address, the portrait's path and its pixel
 * dimensions. Everything else in a content file is prose, and this list
 * is the whole of the exception — there is no per-string exemption list
 * here, because the moment there is one it grows.
 */
const NOT_READ = new Set([
  "body",
  "id",
  "icon",
  "accent",
  "tone",
  "url",
  "href",
  "imageUrl",
  "imageWidth",
  "imageHeight",
]);

/** Every string under a key a reader is meant to see. */
function readable(value: unknown, key?: string): string[] {
  if (key !== undefined && NOT_READ.has(key)) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((item) => readable(item, key));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([name, item]) => readable(item, name));
  }
  return [];
}

const VALUES = { yearsOfExperience: String(yearsOfExperience) };

const files = readdirSync(contentDir).filter((file) => file.endsWith(".json"));

const wanted = [
  ...new Set(
    files.flatMap((file) =>
      readable(
        fillPlaceholders(JSON.parse(readFileSync(resolve(contentDir, file), "utf8")), VALUES),
      ),
    ),
  ),
];

/** Collapsed whitespace, so reflowed markup does not read as missing text. */
const flat = (text: string) => text.replace(/\s+/g, " ");

function everythingRendered(): string {
  const page = render(
    <MotionProvider>
      <Portfolio />
    </MotionProvider>,
  );
  const cv = render(<CVTemplate />);

  return flat(`${page.container.textContent ?? ""} ${cv.container.textContent ?? ""}`);
}

describe("what src/content says", () => {
  it("is a substantial body of text, so the check below is not vacuous", () => {
    // Measured: 392 distinct reader-facing strings across 14 files. A
    // containment check over an empty list passes perfectly.
    expect(files.length).toBeGreaterThan(10);
    expect(wanted.length).toBeGreaterThan(300);
  });

  it("reaches the page or the printed CV, every string of it", () => {
    const rendered = everythingRendered();

    const unread = wanted.filter((text) => !rendered.includes(flat(text)));

    expect(
      unread,
      `these are in src/content and neither the page nor the printed CV renders them, so an owner who writes them sees nothing happen:\n  ${unread.map((text) => `"${text}"`).join("\n  ")}`,
    ).toEqual([]);
  });
});

describe("the years figure the content asks for", () => {
  it("arrives filled in, not as the placeholder", () => {
    // The two strings that are not literal in content. Without the
    // substitution above they are the only two the check would report, so
    // this holds the substitution rather than leaving it as the reason a
    // measurement came out convenient.
    const rendered = everythingRendered();

    expect(rendered).toContain(`${String(yearsOfExperience)}+ years of experience`);
    expect(rendered).not.toContain("{{yearsOfExperience}}");
  });
});
