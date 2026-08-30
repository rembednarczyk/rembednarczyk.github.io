import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * The import graph, in one place.
 *
 * Two ratchets read it — tests/module-reachability.test.ts asks what
 * nothing imports, tests/wiring.test.ts asks what no test reaches through
 * something that uses it — and two implementations of "what imports what"
 * would eventually disagree, at which point one of them would be quietly
 * wrong about the repository it is guarding.
 */

const SOURCE_EXTENSIONS = [".ts", ".tsx"];

/**
 * How a specifier is resolved to a file. Extensionless imports and
 * directory imports both appear in this repository.
 */
const RESOLUTION_CANDIDATES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

export function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listSourceFiles(full);
    return SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext)) ? [full] : [];
  });
}

/**
 * The files a module imports.
 *
 * Relative and alias specifiers only; a bare specifier is a package.
 * `root` resolves the `@/` alias, which points at the repository root.
 */
export function importedPaths(file: string, root: string): string[] {
  const source = readFileSync(file, "utf8");
  const specifiers = [
    ...source.matchAll(/from\s+["']([^"']+)["']/g),
    ...source.matchAll(/import\s+["']([^"']+)["']/g),
    ...source.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g),
  ].map((m) => m[1]);

  return specifiers
    .filter((s) => s.startsWith(".") || s.startsWith("@/"))
    .map((s) =>
      s.startsWith("@/") ? resolve(root, s.slice(2)) : resolve(dirname(file), s),
    )
    .flatMap((base) => {
      const hit = RESOLUTION_CANDIDATES.map((suffix) => base + suffix).find(
        (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
      );
      return hit ? [hit] : [];
    });
}

/** Everything the given files reach, including the files themselves. */
export function reachableFrom(entries: string[], root: string): Set<string> {
  const seen = new Set<string>();
  const queue = [...entries];

  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    queue.push(...importedPaths(file, root));
  }

  return seen;
}

/** Tests and stories: the files a runner loads directly. */
export function isTestLike(file: string): boolean {
  return /\.(stories|test|spec)\.tsx?$/.test(file);
}
