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
    const match = /import\s+\{([^}]*)\}\s+from\s+["']motion\/react["']/.exec(text);

    return {
      path: relative(root, path).replace(/\\/g, "/"),
      text,
      imports: match ? match[1].split(",").map((n) => n.trim()) : [],
    };
  }),
);

const importingMotion = files.filter((f) => f.imports.length > 0);

describe("the animation feature set", () => {
  it("is loaded once, at the root of the app", () => {
    const app = files.find((f) => f.path === "src/App.tsx");
    expect(app).toBeDefined();
    expect(app!.imports).toContain("LazyMotion");
    expect(app!.imports).toContain("domAnimation");
    expect(app!.text).toMatch(/<LazyMotion features=\{domAnimation\} strict>/);
  });

  it("is also supplied to stories, which mount components on their own", () => {
    // Without this every animated story throws while the page is fine, and
    // the a11y suite reports it as a rendering failure rather than a missing
    // provider.
    const preview = files.find((f) => f.path === ".storybook/preview.ts");
    expect(preview).toBeDefined();
    expect(preview!.imports).toContain("LazyMotion");
    expect(preview!.imports).toContain("domAnimation");
    expect(preview!.text).toContain("strict: true");
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
    expect(importingMotion.length).toBeGreaterThan(10);
    expect(importingMotion.some((f) => f.imports.includes("m"))).toBe(true);
  });
});
