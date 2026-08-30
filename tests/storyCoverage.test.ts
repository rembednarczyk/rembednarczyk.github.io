import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { listSourceFiles } from "../scripts/importGraph";

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
});
