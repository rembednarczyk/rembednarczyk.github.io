import { relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  importedPaths,
  isTestLike,
  listSourceFiles,
  reachableFrom,
} from "../scripts/importGraph";

/**
 * A unit can be correct, tested, and connected to nothing.
 *
 * This happened three times in one sweep of this repository, and every time
 * the mutation that exposed it was the same: delete the call from the place
 * that uses it and watch the suite stay green.
 *
 *   - the error boundary, removed from main.tsx: 239 tests passed, and a
 *     render error would have blanked the page again
 *   - the contact dialog, no longer resetting on close: every hook test
 *     passed while a hung submission stranded the form for good
 *   - useHashTarget, removed from the page: every hook test passed while a
 *     shared link to a section landed at the top
 *
 * Each was patched where it was found — a test reading main.tsx, a story,
 * a page-level render — which is three answers to one question. The
 * question is whether anything exercises a module *through the code that
 * uses it*, and that is a property of the import graph.
 *
 * What this cannot catch is a call site that still calls, but wrongly: the
 * contact dialog's third case was an argument that stopped being passed.
 * That needs a test that runs the thing. This covers the other two.
 */

const root = resolve(__dirname, "..");
const srcDir = resolve(root, "src");

/**
 * Modules the graph cannot reach through a caller, for reasons that are not
 * defects. Each says why, because an unexplained exemption is how a rule
 * stops meaning anything.
 */
const ENTRY_POINTS: Record<string, string> = {
  "src/main.tsx":
    "the browser loads it; what it wires is asserted in src/components/ErrorBoundary.test.tsx",
  "src/test/canvasRecording.ts":
    "a test helper, used by tests by design and by nothing that ships",
};

const EXEMPT = ENTRY_POINTS;

const relativeToRoot = (file: string) => relative(root, file).replace(/\\/g, "/");

const allFiles = [
  ...listSourceFiles(srcDir),
  ...listSourceFiles(resolve(root, "tests")),
];

const production = allFiles.filter(
  (file) =>
    !isTestLike(file) &&
    !file.endsWith(".d.ts") &&
    !file.endsWith("setupTests.ts"),
);

const testRoots = allFiles.filter(isTestLike);

/**
 * Everything a runner reaches, starting from the tests and stories and from
 * the entry points whose contents a test asserts. main.tsx is a root
 * because ErrorBoundary.test.tsx reads it and holds what it mounts; without
 * that assertion it would not belong here.
 */
const reached = reachableFrom(
  [
    ...testRoots,
    // Only the ones that are still there. Walking from a path that no
    // longer exists throws while this module is being loaded, and the
    // assertion written to report exactly that never gets to run — the
    // build goes red with a stack trace instead of a sentence.
    ...Object.keys(ENTRY_POINTS)
      .map((file) => resolve(root, file))
      .filter((file) => production.includes(file)),
  ],
  root,
);

/** Production modules that import the given one. */
function callersOf(module: string): string[] {
  return production.filter((file) => importedPaths(file, root).includes(module));
}

describe("modules nothing exercises through the code that uses them", () => {
  it("has none that are not accounted for", () => {
    const unexercised = production
      .filter((module) => !EXEMPT[relativeToRoot(module)])
      .filter((module) => !callersOf(module).some((caller) => reached.has(caller)))
      .map(relativeToRoot);

    expect(
      unexercised,
      "nothing a test runs imports these, so removing the call that uses them would change no result:\n  " +
        unexercised.join("\n  "),
    ).toEqual([]);
  });

  it("reads a real graph, so the check above is not vacuous", () => {
    // A broken root or a resolver that matches nothing would leave every
    // module trivially fine.
    expect(production.length).toBeGreaterThan(30);
    expect(testRoots.length).toBeGreaterThan(20);
    expect(reached.size).toBeGreaterThan(production.length);
  });

  it("finds the app through the entry point rather than around it", () => {
    // The specific relationship that broke: App and the error boundary are
    // reached only via main.tsx. If that stops being a root, or main.tsx
    // stops importing them, this check has to notice.
    expect(reached.has(resolve(srcDir, "App.tsx"))).toBe(true);
    expect(reached.has(resolve(srcDir, "components/ErrorBoundary.tsx"))).toBe(true);
  });
});

describe("the exemptions", () => {
  it("names files that exist", () => {
    // An exemption for a deleted file is a rule with a hole in it that
    // nothing would report.
    const missing = Object.keys(EXEMPT).filter(
      (file) => !production.some((module) => relativeToRoot(module) === file),
    );

    expect(missing, "exempted but no longer in the repository").toEqual([]);
  });

  it("exempts nothing that has since been wired up", () => {
    /**
     * An exemption is for a module the graph cannot reach through a caller.
     * The moment one has a caller that a test reaches, the exemption is
     * covering something it was not written for — and for the test helper
     * it would mean worse than that: production code importing it puts a
     * test fixture in the bundle.
     *
     * The list this once held two more entries — a Card and a Badge no page
     * rendered — and it shrank when they were deleted. It may shrink and
     * may not grow.
     */
    const stale = Object.keys(EXEMPT).filter((file) => {
      const module = production.find((m) => relativeToRoot(m) === file);
      return (
        module !== undefined &&
        callersOf(module).some((caller) => reached.has(caller))
      );
    });

    expect(
      stale,
      "these are used now, so they no longer need to be listed here",
    ).toEqual([]);
  });

  it("gives a reason for each", () => {
    Object.entries(EXEMPT).forEach(([file, reason]) => {
      expect(reason.length, `${file} is exempt without saying why`).toBeGreaterThan(20);
    });
  });
});
