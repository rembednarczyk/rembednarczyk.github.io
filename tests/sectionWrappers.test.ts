import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isTestLike, listSourceFiles } from "../scripts/importGraph";

/**
 * Ten sections of this page each wrote out their own wrapper: the anchor, the
 * reveal, the heading. Nine of them were the same twenty-three lines with
 * four words changed, and the tenth had already drifted — a longer slide, a
 * slower duration, a different easing — with nothing to notice.
 *
 * That is the defect this guards. The wrapper now lives in one place, and a
 * new section that copies its neighbour instead of using it puts the drift
 * back on the board. Copying is how it happened the first time.
 *
 * The exemption list started at four and is now one, which is the component
 * the others are meant to use. What the copies disagreed about was taste —
 * a distance, a duration — but what they agreed on was a contract: `once`,
 * so a section does not replay on the way back up, and the viewport margin.
 * Those are the ones a copy gets wrong silently.
 */

const root = resolve(__dirname, "..");
const relativeToRoot = (file: string) => relative(root, file).replace(/\\/g, "/");

/**
 * The JSX prop, not the word. Prose mentioning `whileInView` in a comment is
 * not a hand-rolled reveal, and matching it made this rule fire on a file
 * that only described one.
 */
const DECLARES_A_REVEAL = /whileInView=/;

const HAND_ROLLED_REVEAL: Record<string, string> = {
  "src/components/ui/Reveal.tsx": "the one the others are meant to use",
};

const production = [...listSourceFiles(resolve(root, "src"))].filter(
  (file) =>
    !isTestLike(file) &&
    !file.endsWith(".stories.tsx") &&
    !file.endsWith("src/setupTests.ts"),
);

describe("the numbered sections share one wrapper", () => {
  it("finds the sections to check", () => {
    expect(production.length).toBeGreaterThan(20);
  });

  it("leaves the reveal to Reveal", () => {
    const rolled = production
      .map(relativeToRoot)
      .filter(
        (file) =>
          DECLARES_A_REVEAL.test(readFileSync(resolve(root, file), "utf8")) &&
          !(file in HAND_ROLLED_REVEAL),
      );

    expect(rolled).toEqual([]);
  });

  it("leaves the numbered heading to PageSection", () => {
    const heads = production
      .map(relativeToRoot)
      .filter(
        (file) =>
          file !== "src/components/ui/SectionHeading.tsx" &&
          file !== "src/components/ui/PageSection.tsx" &&
          readFileSync(resolve(root, file), "utf8").includes("<SectionHeading"),
      );

    expect(heads).toEqual([]);
  });

  it("names a reason for anything standing outside the wrapper", () => {
    for (const [file, reason] of Object.entries(HAND_ROLLED_REVEAL)) {
      expect(readFileSync(resolve(root, file), "utf8")).toMatch(DECLARES_A_REVEAL);
      expect(reason.length).toBeGreaterThan(20);
    }
  });
});
