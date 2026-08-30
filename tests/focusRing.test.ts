import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isTestLike, listSourceFiles } from "../scripts/importGraph";

/**
 * Twenty controls spelled out their own focus indicator, in two variants:
 * eleven with the ring flush against the element, nine with a two-pixel gap
 * filled in the page colour. Eight more — every link on a project card —
 * declared nothing at all and fell back to the browser's own ring, which is
 * visible but is not this page's. Measured by tabbing the built page: four
 * different indicators across twenty-nine keyboard stops.
 *
 * The two ring variants existed for a reason. `ring-offset` paints the
 * background colour into the gap, so it has to know what is behind it, and
 * `#020617` is wrong on a modal. An outline offset paints nothing in the
 * gap, so `focus-ring` in src/index.css covers both and hard-codes no
 * background at all.
 *
 * The skip link is the one deliberate exception, named below: it turns cyan
 * when focused, and a cyan ring on a cyan button is no indicator.
 */

const root = resolve(__dirname, "..");
const relativeToRoot = (file: string) => relative(root, file).replace(/\\/g, "/");

/**
 * Controls that draw their own focus indicator, with the reason. An
 * unexplained exemption is how a rule stops meaning anything.
 */
const OWN_INDICATOR: Record<string, string> = {
  "src/App.tsx":
    "the skip link turns cyan when focused, so its ring is white — a cyan ring on a cyan button shows nothing",
};

const production = listSourceFiles(resolve(root, "src")).filter(
  (file) => !isTestLike(file) && !file.endsWith(".stories.tsx"),
);

/** Any focus-state utility spelled into a className. */
const HAND_WRITTEN = /focus(-visible)?:(outline|ring)/;

describe("the focus indicator", () => {
  it("finds the files it is checking, so none of this passes vacuously", () => {
    expect(production.length).toBeGreaterThan(20);
  });

  it("is declared in one place, and used by name everywhere else", () => {
    const spelled = production
      .map(relativeToRoot)
      .filter(
        (file) =>
          HAND_WRITTEN.test(readFileSync(resolve(root, file), "utf8")) &&
          !(file in OWN_INDICATOR),
      );

    expect(
      spelled,
      `these draw their own focus indicator instead of using focus-ring:\n  ${spelled.join("\n  ")}`,
    ).toEqual([]);
  });

  it("names a reason for the one control that draws its own", () => {
    for (const [file, reason] of Object.entries(OWN_INDICATOR)) {
      expect(readFileSync(resolve(root, file), "utf8")).toMatch(HAND_WRITTEN);
      expect(reason.length).toBeGreaterThan(20);
    }
  });

  it("defines focus-ring as an outline, so nothing has to know the background", () => {
    // A ring offset paints the page colour behind the gap. That is what
    // split the twenty controls into two variants, and what would make a
    // control on a panel draw a slab of #020617 around itself.
    const css = readFileSync(resolve(root, "src/index.css"), "utf8");

    // The block itself, not the file: asserting the declarations anywhere in
    // index.css let a mutation gut focus-ring while focus-ring-always kept
    // the assertion true. scripts/runFocusIndicator.ts caught that one, and
    // this should have too.
    const block = /@utility focus-ring \{\s*&:focus-visible \{([\s\S]*?)\n {2}\}/.exec(css);

    expect(block, "focus-ring is not declared as a :focus-visible rule").not.toBeNull();
    expect(block![1]).toContain("outline: 2px solid var(--color-cyan-400)");
    expect(block![1]).toContain("outline-offset: 2px");
    expect(block![1]).not.toContain("#020617");
  });

  it("shows the same indicator on a clicked text field, and only there", () => {
    // :focus-visible stays quiet on a click, which is right for a button
    // and wrong for an input: someone clicking into a field is about to
    // type into it. The look is shared; only the trigger differs.
    const css = readFileSync(resolve(root, "src/index.css"), "utf8");
    expect(css).toMatch(/@utility focus-ring-always \{\s*&:focus \{/);

    const always = production
      .map(relativeToRoot)
      .filter((file) =>
        readFileSync(resolve(root, file), "utf8").includes("focus-ring-always"),
      );

    expect(
      always,
      "only the contact form's fields should show focus on a click",
    ).toEqual(["src/components/ui/ContactModal.tsx"]);
  });

  it("is reached by the controls that had no indicator of their own", () => {
    // Every link on a project card fell back to the browser's ring. There
    // are eight of them on the page and one place in the source.
    const card = readFileSync(
      resolve(root, "src/components/sections/Projects/ProjectCard.tsx"),
      "utf8",
    );

    expect(card).toContain("focus-ring");
  });
});
