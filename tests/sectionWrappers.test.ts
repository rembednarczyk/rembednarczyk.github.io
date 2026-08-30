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
 * Two sections legitimately stand outside: they are named here with the
 * reason, because an unexplained exemption is how a rule stops meaning
 * anything.
 */

const root = resolve(__dirname, "..");
const relativeToRoot = (file: string) => relative(root, file).replace(/\\/g, "/");

const HAND_ROLLED_REVEAL: Record<string, string> = {
  "src/components/sections/ThinkingSection.tsx":
    "a pull quote, not a numbered section: it slides further and slower on purpose",
  "src/components/sections/ContactSection.tsx":
    "centres its own closing heading rather than using the numbered one",
  "src/components/ui/PageSection.tsx": "the one the others are meant to use",
  "src/App.tsx": "the page frame, not a section",
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

  it("leaves the reveal to PageSection", () => {
    const rolled = production
      .map(relativeToRoot)
      .filter(
        (file) =>
          readFileSync(resolve(root, file), "utf8").includes("whileInView") &&
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

  it("names a reason for every section standing outside the wrapper", () => {
    for (const [file, reason] of Object.entries(HAND_ROLLED_REVEAL)) {
      expect(readFileSync(resolve(root, file), "utf8")).toContain("whileInView");
      expect(reason.length).toBeGreaterThan(20);
    }
  });
});
