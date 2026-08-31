import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { listSourceFiles } from "../scripts/importGraph";
import { withoutComments } from "../scripts/withoutComments";

/**
 * Both guideline documents say every component in `src/components/ui/` must
 * have a story, and neither said it to anything that runs. Four components
 * were added without one — IconCard, IconListItem, Modal and PageSection —
 * and the documents went on claiming otherwise for two pull requests.
 *
 * The rule is not paperwork. `.storybook/preview.ts` sets the accessibility
 * addon to `test: 'error'`, so every story is an axe run that fails the
 * build. A component with no story is a component the scan never sees on its
 * own — only, at best, buried inside a whole-page render where a contrast
 * failure on a 320px card has nowhere to show.
 */

const root = resolve(__dirname, "..");
const uiDir = resolve(root, "src/components/ui");

const components = listSourceFiles(uiDir).filter(
  (file) =>
    file.endsWith(".tsx") &&
    !file.endsWith(".stories.tsx") &&
    !file.endsWith(".test.tsx"),
);

describe("every reusable component has a story", () => {
  it("finds the components it is checking, so this cannot pass vacuously", () => {
    expect(components.length).toBeGreaterThan(8);
  });

  it("has one for each", () => {
    const without = components
      .filter((file) => !existsSync(file.replace(/\.tsx$/, ".stories.tsx")))
      .map((file) => basename(file));

    expect(
      without,
      `these have no story, so the accessibility addon never scans them on their own:\n  ${without.join("\n  ")}`,
    ).toEqual([]);
  });

  /**
   * And each of those files exports a story.
   *
   * The check above asked whether a file exists, which is a proxy for the
   * property rather than the property: a `.stories.tsx` with a `meta`
   * default export and no named story satisfies it, indexes zero stories,
   * and gives the addon nothing to scan. The rule is the axe run, not the
   * filename.
   */
  it("exports at least one story from each", () => {
    const empty = components
      .map((file) => file.replace(/\.tsx$/, ".stories.tsx"))
      .filter(existsSync)
      .filter((file) => {
        // Comments off first. A story commented out satisfies a text match
        // over raw source, and this check was added in the same body of
        // work that extracted withoutComments for exactly that class — the
        // one consumer that did not get it.
        const source = withoutComments(readFileSync(file, "utf8"));
        return !/export\s+const\s+[A-Z][A-Za-z0-9]*\s*[:=]/.test(source);
      })
      .map((file) => basename(file));

    expect(
      empty,
      `these are story files that export no story, so Storybook indexes nothing and the accessibility addon scans nothing:\n  ${empty.join("\n  ")}`,
    ).toEqual([]);
  });
});
