import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AI_INSTRUCTIONS.md draws the project's shape as a tree, and the tree had
 * been wrong for a while: `src/lib/` and `src/test/` both existed and
 * neither appeared, so a document telling a contributor where things go was
 * silent about two of the places they go.
 *
 * A tree in prose is a count quoted in prose. It gets re-derived here.
 */

const root = resolve(__dirname, "..");
const instructions = readFileSync(
  resolve(root, "docs/guidelines/AI_INSTRUCTIONS.md"),
  "utf8",
);

/**
 * `__snapshots__` is where Vitest writes, not where anything is put by hand.
 * A tree that draws it would be documenting a build artifact as architecture.
 */
const isArtifact = (name: string) => name.startsWith("__");

const directoriesUnder = (dir: string) =>
  readdirSync(resolve(root, dir))
    .filter(
      (entry) =>
        statSync(resolve(root, dir, entry)).isDirectory() && !isArtifact(entry),
    )
    .sort();

/** The fenced block that draws the tree. */
const tree = /```text\s*\nsrc\/\n([\s\S]*?)```/.exec(instructions)?.[1] ?? "";

/**
 * Every directory the tree draws, as a path rather than as a name.
 *
 * A bare name is not unique across levels, and keying on one made the check
 * answer a different question than the one it was written for. Measured: it
 * drew `components, layout, sections, ui, data, hooks, lib, test, types,
 * utils` as one flat set, so creating `src/ui/`, `src/sections/` or
 * `src/layout/` — top-level directories the tree does not show — reported
 * nothing undrawn, because the names already appeared one level down. The
 * inverse held too: the tree could draw `components/data/`, which does not
 * exist, and "draws nothing that is not there" passed on the top-level
 * `data/`.
 *
 * Depth comes from the box-drawing prefix: each level of nesting adds four
 * columns before the branch.
 */
const drawn = (() => {
  const paths: string[] = [];
  let parent = "";

  for (const line of tree.split("\n")) {
    const branch = /^((?:[│|]\s{3}|\s{4})*)[├└]──\s+([a-zA-Z][\w-]*)\//.exec(line);
    if (!branch) continue;

    const depth = branch[1].length / 4;
    const name = branch[2];

    if (depth === 0) {
      parent = name;
      paths.push(`src/${name}`);
    } else {
      paths.push(`src/${parent}/${name}`);
    }
  }

  return paths;
})();

/** The same two levels of the real tree, as paths. */
const real = [
  ...directoriesUnder("src").map((name) => `src/${name}`),
  ...directoriesUnder("src/components").map((name) => `src/components/${name}`),
];

describe("the documented project structure", () => {
  it("finds the tree it is checking", () => {
    expect(tree.length, "AI_INSTRUCTIONS.md no longer draws a src/ tree").toBeGreaterThan(40);
    expect(drawn.length).toBeGreaterThan(5);
  });

  it("reads the nesting, not just the names", () => {
    // Guards the parser: if the depth were lost, every path would collapse
    // to the top level and the two checks below would be back to comparing
    // bare names.
    expect(drawn).toContain("src/components/ui");
    expect(drawn).toContain("src/hooks");
    expect(drawn).not.toContain("src/ui");
  });

  it("draws every directory src/ and src/components/ have", () => {
    const undrawn = real.filter((path) => !drawn.includes(path));

    expect(
      undrawn,
      `these exist and the tree does not show them:\n  ${undrawn.join("\n  ")}`,
    ).toEqual([]);
  });

  it("draws nothing that is not there", () => {
    const imaginary = drawn.filter((path) => !real.includes(path));

    expect(
      imaginary,
      `the tree shows these and there is no such directory:\n  ${imaginary.join("\n  ")}`,
    ).toEqual([]);
  });
});
