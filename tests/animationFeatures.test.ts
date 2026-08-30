import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The page loads motion's animation feature set once, at the root, and uses
 * `m` everywhere instead of `motion`. That is worth 46 kB raw and 14 kB
 * gzipped, which is a tenth of the compressed payload.
 *
 * A `motion.div` left behind is caught at runtime: LazyMotion runs in strict
 * mode and throws, which turns the whole App suite red. Switching the
 * feature set is not caught that way. `domMax` renders everything perfectly
 * and quietly puts the bundle back, so it needs a rule of its own.
 *
 * The setup used to be written out three times — the app, the Storybook
 * preview, and the 404 tests each built their own LazyMotion. Three copies
 * of a wrapper is three answers to any question asked of it, and one such
 * question had no answer at all in any of them: `prefers-reduced-motion`.
 * So there is now one wrapper, and the rule below is that nothing builds
 * a second.
 */

const root = resolve(__dirname, "..");
const SOURCE_ROOTS = ["src", ".storybook"];
const SOURCE_EXTENSIONS = [".ts", ".tsx"];

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listSourceFiles(full);
    return SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext)) ? [full] : [];
  });
}

interface SourceFile {
  path: string;
  text: string;
  /** The names imported from motion/react, if any. */
  imports: string[];
}

const files: SourceFile[] = SOURCE_ROOTS.flatMap((dir) =>
  listSourceFiles(resolve(root, dir)).map((path) => {
    const text = readFileSync(path, "utf8");
    // Every import from motion/react, not the first: a second statement in
    // the same file used to slip past this, and a mutation adding one to
    // ScrollToTop left the whole suite green.
    const named = [
      ...text.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']motion\/react["']/g),
    ];

    return {
      path: relative(root, path).replace(/\\/g, "/"),
      text,
      imports: named.flatMap((m) => m[1].split(",").map((n) => n.trim())),
    };
  }),
);

const importingMotion = files.filter((f) => f.imports.length > 0);

describe("the animation feature set", () => {
  it("is loaded once, by the one provider", () => {
    const provider = files.find(
      (f) => f.path === "src/components/MotionProvider.tsx",
    );
    expect(provider).toBeDefined();
    expect(provider!.imports).toContain("LazyMotion");
    expect(provider!.imports).toContain("domAnimation");
    expect(provider!.text).toMatch(/<LazyMotion features=\{domAnimation\} strict>/);
  });

  it("answers prefers-reduced-motion there too, so one wrapper is one answer", () => {
    // Twelve entrance animations ignored the setting while the particle
    // canvas and the 404 view honoured it. Deleting this line puts the page
    // back to disagreeing with itself, and every other check stays green:
    // src/components/ui/Reveal.stories.tsx measures the slide in a browser,
    // which is the only place the difference is visible.
    const provider = files.find(
      (f) => f.path === "src/components/MotionProvider.tsx",
    );
    expect(provider!.imports).toContain("MotionConfig");
    expect(provider!.text).toMatch(/<MotionConfig reducedMotion="user">/);
  });

  it("is nowhere built a second time", () => {
    // Without this every animated story throws while the page is fine, and
    // the a11y suite reports it as a rendering failure rather than a missing
    // provider — which is why a second copy is so tempting to write.
    const rival = files
      .filter(
        (f) =>
          f.path !== "src/components/MotionProvider.tsx" &&
          f.imports.includes("LazyMotion"),
      )
      .map((f) => f.path);

    expect(
      rival,
      `these set motion up themselves instead of using MotionProvider:\n  ${rival.join("\n  ")}`,
    ).toEqual([]);
  });

  it("is supplied to stories, which mount components on their own", () => {
    const preview = files.find((f) => f.path === ".storybook/preview.ts");
    expect(preview).toBeDefined();
    expect(preview!.text).toContain("MotionProvider");
  });

  it("is never domMax, which renders the same and costs the saving", () => {
    // The one regression nothing else would report: everything still works.
    const wide = files.filter((f) => f.imports.includes("domMax"));
    expect(
      wide.map((f) => f.path),
      "domMax carries drag, layout and gesture support, none of which this page uses",
    ).toEqual([]);
  });

  it("never reaches for the motion component, which carries every feature", () => {
    const strays = importingMotion
      .filter((f) => f.imports.includes("motion"))
      .map((f) => f.path);

    expect(
      strays,
      `these import motion rather than m:\n  ${strays.join("\n  ")}`,
    ).toEqual([]);
  });

  it("finds the files it is checking, so none of the above passes vacuously", () => {
    expect(importingMotion.length).toBeGreaterThan(5);
    expect(importingMotion.some((f) => f.imports.includes("m"))).toBe(true);
  });
});
