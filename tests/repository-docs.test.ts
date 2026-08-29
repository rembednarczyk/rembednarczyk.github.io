import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Engineering Principles, section 1: never trust a version, a count, or a
 * status quoted in prose. Re-derive it from the source of truth.
 *
 * Prose goes stale the moment the code moves, and a README nobody re-checks
 * is the first place that happens. Every version and every workflow this
 * repository states about itself is verified here against package.json and
 * the workflow directory, so a stale claim fails the build instead of
 * quietly misinforming a reader.
 */

const root = resolve(__dirname, "..");
const readme = readFileSync(resolve(root, "README.md"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

/** Badge label or prose name -> the package that decides its version. */
const VERSIONED_NAMES: Record<string, string> = {
  React: "react",
  TypeScript: "typescript",
  Vite: "vite",
  "Tailwind CSS": "tailwindcss",
  Tailwind_CSS: "tailwindcss",
};

function installedMajor(packageName: string): number {
  const range =
    pkg.dependencies?.[packageName] ?? pkg.devDependencies?.[packageName];

  if (!range) {
    throw new Error(`${packageName} is in neither dependency list`);
  }

  return Number(range.replace(/^[^\d]*/, "").split(".")[0]);
}

describe("versions the README states about itself", () => {
  it.each(Object.entries(VERSIONED_NAMES))(
    "every '%s <version>' matches package.json",
    (label, packageName) => {
      const expected = installedMajor(packageName);
      // Matches both the shields.io badge form (React-19-61DAFB) and prose
      // ("React 19 with TypeScript 6").
      const pattern = new RegExp(`${label}[ _-](\\d+)`, "g");
      const quoted = [...readme.matchAll(pattern)].map((m) => Number(m[1]));

      quoted.forEach((major) => expect(major).toBe(expected));
    },
  );

  it("states a version for every tech the badges advertise", () => {
    // Guards the guard: if a badge is renamed so it no longer matches the map
    // above, the assertions turn into no-ops and stop protecting anything.
    const badgeLabels = [...readme.matchAll(/img\.shields\.io\/badge\/([^-]+)-/g)]
      .map((m) => decodeURIComponent(m[1]))
      .filter((label) => !["Performance", "Accessibility", "Best%20Practices", "Best Practices", "SEO"].includes(label));

    expect(badgeLabels.length).toBeGreaterThan(0);
    badgeLabels.forEach((label) =>
      expect(Object.keys(VERSIONED_NAMES)).toContain(label),
    );
  });
});

describe("workflows the README links to", () => {
  it("points every status badge at a workflow that exists", () => {
    const referenced = [
      ...readme.matchAll(/actions\/workflows\/([\w.-]+\.ya?ml)/g),
    ].map((m) => m[1]);

    expect(referenced.length).toBeGreaterThan(0);
    [...new Set(referenced)].forEach((file) =>
      expect(
        existsSync(resolve(root, ".github/workflows", file)),
        `README references .github/workflows/${file}, which does not exist`,
      ).toBe(true),
    );
  });
});

describe("files the README links to", () => {
  it("resolves every relative link", () => {
    const links = [...readme.matchAll(/\]\((?!https?:|#)([^)\s]+)\)/g)].map(
      (m) => m[1].split("#")[0],
    );

    expect(links.length).toBeGreaterThan(0);
    [...new Set(links)].forEach((link) =>
      expect(
        existsSync(resolve(root, link)),
        `README links to ${link}, which does not exist`,
      ).toBe(true),
    );
  });
});

/**
 * Comments are removed before the source is searched. A name that survives
 * only in a note explaining its removal is exactly the case this exists for:
 * the README described `formatProjectTags` as "covered by tests and called by
 * nothing yet" for three merges after it had been deleted, while the only
 * trace of it in the code was the comment recording that it was gone.
 *
 * The `//` rule ignores a slash preceded by a quote or a colon, so a URL
 * inside a string is not mistaken for a comment.
 */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1 ");
}

/** Every file and every directory below `dir`, so both forms can be matched. */
function listEntries(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? [full, ...listEntries(full)] : [full];
  });
}

const SEARCHED_ROOTS = ["src", "scripts", "tests", "docs", ".github"];

const allEntries = SEARCHED_ROOTS.flatMap((dir) => listEntries(resolve(root, dir)))
  .concat([resolve(root, "package.json"), resolve(root, "vite.config.ts")])
  .map((f) => f.replace(/\\/g, "/"));

const codeWithoutComments = allEntries
  .filter((f) => /\.tsx?$/.test(f))
  .map((f) => withoutComments(readFileSync(f, "utf8")))
  .join("\n");

/** Anything backticked that reads as a path or a filename. */
const quotedPaths = [
  ...new Set(
    [...readme.matchAll(/`([\w@./-]*[\w-]\.(?:tsx?|jsx?|json|ya?ml|xml|md)|[\w./-]+\/)`/g)].map(
      (m) => m[1],
    ),
  ),
];

/** Backticked camelCase names: a lower-case start with a capital inside. */
const quotedIdentifiers = [
  ...new Set(
    [...readme.matchAll(/`([a-z][a-zA-Z0-9]*)`/g)]
      .map((m) => m[1])
      .filter((name) => /[A-Z]/.test(name)),
  ),
];

describe("withoutComments", () => {
  /**
   * The rule the whole symbol check rests on. Tested directly, because
   * proving it through the repository would need a name whose only
   * occurrence anywhere is a comment, and contriving one proves less.
   */
  it("removes a block comment", () => {
    expect(withoutComments("/* formatProjectTags */ const a = 1;")).not.toMatch(
      /formatProjectTags/,
    );
  });

  it("removes a line comment", () => {
    expect(withoutComments("const a = 1; // formatProjectTags")).not.toMatch(
      /formatProjectTags/,
    );
  });

  it("removes the JSDoc a deletion leaves behind", () => {
    const source = `/**
 * \`formatProjectTags\` used to live here, joining tags with a separator.
 */
export function getYearsOfExperience() {}`;

    const stripped = withoutComments(source);
    expect(stripped).not.toMatch(/formatProjectTags/);
    expect(stripped).toMatch(/getYearsOfExperience/);
  });

  it("keeps a URL, which is not a comment however much it looks like one", () => {
    // Without the guard this eats the rest of the line, and a symbol
    // declared next to a link would read as deleted.
    const source = 'const endpoint = "https://api.example.com"; const useThing = 1;';
    expect(withoutComments(source)).toMatch(/useThing/);
  });
});

describe("things the README names", () => {
  it("names only files that exist", () => {
    // Matched as a suffix, since the README abbreviates some paths
    // ("utils/domain.ts") and generalises others (".stories.tsx").
    const missing = quotedPaths.filter((quoted) => {
      const trimmed = quoted.replace(/\/$/, "");

      // A leading dot with no separator is an extension pattern rather than
      // a path: the README says "every `.stories.tsx` file".
      if (trimmed.startsWith(".") && !trimmed.includes("/")) {
        return !allEntries.some((entry) => entry.endsWith(trimmed));
      }

      return !allEntries.some(
        (entry) => entry === trimmed || entry.endsWith(`/${trimmed}`),
      );
    });

    expect(quotedPaths.length).toBeGreaterThan(5);
    expect(
      missing,
      `the README names these, and nothing in the repository matches:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("names only symbols the code still contains", () => {
    const missing = quotedIdentifiers.filter(
      (name) => !new RegExp(`\\b${name}\\b`).test(codeWithoutComments),
    );

    expect(quotedIdentifiers.length).toBeGreaterThan(5);
    expect(
      missing,
      `the README describes these, and the code no longer defines them:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("reads real source, so neither check above passes vacuously", () => {
    // A broken root would leave both haystacks empty and let anything through.
    expect(allEntries.length).toBeGreaterThan(50);
    expect(codeWithoutComments).toContain("getYearsOfExperience");
  });
});

describe("guideline documents", () => {
  it("keeps both guideline documents present and non-empty", () => {
    ["ENGINEERING_PRINCIPLES.md", "AI_INSTRUCTIONS.md"].forEach((file) => {
      const path = resolve(root, "docs/guidelines", file);
      expect(existsSync(path), `${file} is missing`).toBe(true);
      expect(readFileSync(path, "utf8").trim().length).toBeGreaterThan(0);
    });
  });
});
