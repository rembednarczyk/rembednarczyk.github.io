import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Engineering Principles, section 4: a control attached to nothing is
 * deleted, not wired up.
 *
 * This repository has already paid for the absence of this check. Ten
 * section components existed in two copies, a flat one and a nested one,
 * and only the nested ones were imported. The unreachable copies drifted
 * from the live ones by up to 96 lines while lint, tsc and the whole test
 * suite stayed green, so editing the wrong file changed nothing and
 * reported nothing.
 *
 * The graph below starts from the entry point and every test and story,
 * and fails on any module nothing reaches.
 */

const root = resolve(__dirname, "..");
const srcDir = resolve(root, "src");

/**
 * Ambient declaration files are loaded by the compiler through tsconfig
 * `include`, never through an import, so the import graph cannot see them by
 * design. The same is true of the vitest setup file, which is named in
 * vitest.config.ts. Excluding them removes a false positive rather than
 * relaxing the check: an unreferenced `.d.ts` is caught by noUnusedLocals
 * and by tsc having nothing to apply it to.
 */
const CONFIG_OWNED = new Set(["src/setupTests.ts"]);
const isAmbientDeclaration = (rel: string) => rel.endsWith(".d.ts");

const SOURCE_EXTENSIONS = [".ts", ".tsx"];
const RESOLUTION_CANDIDATES = [
  "",
  ".ts",
  ".tsx",
  "/index.ts",
  "/index.tsx",
];

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listSourceFiles(full);
    return SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext)) ? [full] : [];
  });
}

/** Relative and alias specifiers only; a bare specifier is a package. */
function importedPaths(file: string): string[] {
  const source = readFileSync(file, "utf8");
  const specifiers = [
    ...source.matchAll(/from\s+["']([^"']+)["']/g),
    ...source.matchAll(/import\s+["']([^"']+)["']/g),
    ...source.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g),
  ].map((m) => m[1]);

  return specifiers
    .filter((s) => s.startsWith(".") || s.startsWith("@/"))
    .map((s) => (s.startsWith("@/") ? resolve(root, s.slice(2)) : resolve(dirname(file), s)))
    .flatMap((base) => {
      const hit = RESOLUTION_CANDIDATES.map((suffix) => base + suffix).find(
        (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
      );
      return hit ? [hit] : [];
    });
}

function reachableFrom(entries: string[]): Set<string> {
  const seen = new Set<string>();
  const queue = [...entries];

  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    queue.push(...importedPaths(file));
  }

  return seen;
}

describe("module reachability", () => {
  it("has no module that nothing imports", () => {
    const all = listSourceFiles(srcDir);

    // Roots: the app entry, plus every story and test, since those are
    // entry points the bundler and the runners load directly.
    const entries = [
      resolve(srcDir, "main.tsx"),
      ...all.filter((f) => /\.(stories|test|spec)\.tsx?$/.test(f)),
      ...listSourceFiles(resolve(root, "tests")),
    ];

    const reachable = reachableFrom(entries);

    const orphans = all
      .map((f) => relative(root, f).replace(/\\/g, "/"))
      .filter((rel) => !CONFIG_OWNED.has(rel) && !isAmbientDeclaration(rel))
      .filter((rel) => !reachable.has(resolve(root, rel)));

    expect(
      orphans,
      `these modules are imported by nothing. Delete them, or wire them up:\n  ${orphans.join("\n  ")}`,
    ).toEqual([]);
  });

  it("resolves the entry point, so the graph is not empty by accident", () => {
    // Without this, a broken entry path would make the check above pass
    // trivially with an empty reachable set.
    const reachable = reachableFrom([resolve(srcDir, "main.tsx")]);
    expect(reachable.size).toBeGreaterThan(20);
  });
});
