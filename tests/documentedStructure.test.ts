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

/** Every `name/` the tree draws, at any depth. */
const drawn = [...tree.matchAll(/([a-zA-Z][\w-]*)\//g)].map((m) => m[1]);

describe("the documented project structure", () => {
  it("finds the tree it is checking", () => {
    expect(tree.length, "AI_INSTRUCTIONS.md no longer draws a src/ tree").toBeGreaterThan(40);
    expect(drawn.length).toBeGreaterThan(5);
  });

  it("draws every directory src/ has", () => {
    const undrawn = directoriesUnder("src").filter((name) => !drawn.includes(name));

    expect(
      undrawn,
      `these exist under src/ and the tree does not show them:\n  ${undrawn.join("\n  ")}`,
    ).toEqual([]);
  });

  it("draws every directory src/components/ has", () => {
    const undrawn = directoriesUnder("src/components").filter(
      (name) => !drawn.includes(name),
    );

    expect(undrawn).toEqual([]);
  });

  it("draws nothing that is not there", () => {
    const real = new Set([
      ...directoriesUnder("src"),
      ...directoriesUnder("src/components"),
    ]);
    const imaginary = drawn.filter((name) => !real.has(name));

    expect(
      imaginary,
      `the tree shows these and src/ has no such directory:\n  ${imaginary.join("\n  ")}`,
    ).toEqual([]);
  });
});
