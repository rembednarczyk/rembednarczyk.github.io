import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { withoutComments } from "../scripts/withoutComments";

/**
 * Ways of Working, Part 2: never quote a version, a count, or a status from
 * prose. Re-derive it from the source of truth.
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
 * The stripper is shared, and its fixtures stay here.
 *
 * There were three copies of it — this one, the dependency gate's, and the
 * one the import graph did not have — so the graph both reachability
 * ratchets read was the one still reading prose as code. It is one function
 * now, in `scripts/withoutComments.ts`.
 *
 * The tests for it did not move with it. They are written around
 * `formatProjectTags`, a name this repository deleted, and two of them are
 * regex literals that no stripping reaches; this file is already the one
 * excluded from the haystack below for exactly that reason, so moving them
 * would move the fixtures out from behind the exclusion and reopen the hole
 * it closes.
 */

/** Every file and every directory below `dir`, so both forms can be matched. */
function listEntries(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? [full, ...listEntries(full)] : [full];
  });
}

/**
 * `.storybook` was missing, so nothing the README said about the Storybook
 * configuration was checked at all — a reference to `.storybook/preview.ts`
 * read as a file that does not exist.
 */
const SEARCHED_ROOTS = [
  "src",
  "scripts",
  "tests",
  "docs",
  ".github",
  ".storybook",
  ".claude",
  "public",
];

const allEntries = SEARCHED_ROOTS.flatMap((dir) => [
  // The root itself as well as its contents: listEntries only reports
  // directories it descends into, so `public/` on its own matched nothing.
  resolve(root, dir),
  ...listEntries(resolve(root, dir)),
])
  .concat([
    resolve(root, "package.json"),
    resolve(root, "vite.config.ts"),
    // The document a visitor actually receives. Two of the guards written
    // down in the README hold it to something — the analytics tag it must
    // not fetch before the banner is answered, and the consent key it reads
    // in plain JavaScript because the app's copy cannot reach it in time —
    // so both entries name it, and without this the README would have been
    // reported as pointing at a file this repository does not have.
    resolve(root, "index.html"),
    // The two documents that live at the root. Without them the backlog
    // naming CLAUDE.md was reported as naming a file the repository does
    // not have — while the check was reading that very file two lines
    // above. A check's reach decides what it can see, which is the third
    // time that lesson has cost something here.
    resolve(root, "README.md"),
    resolve(root, "CLAUDE.md"),
  ])
  .map((f) => f.replace(/\\/g, "/"));

/**
 * The haystack the symbol checks below search.
 *
 * `.claude/settings.json` is in it as well as the source, because the hook
 * configuration is where some of the names the documents use actually live:
 * `SessionStart` and `PreToolUse` are real and are not TypeScript, and a
 * check that only reads `.ts` files reported the first of them as a name
 * nothing in the repository goes by. That is the same lesson the extension
 * list in `pathsNamedIn` already carries — a check's reach decides what it
 * can see — and correcting the reach is not the same as widening the rule.
 * Only that one file: package.json is a list of other people's package
 * names, and admitting it would satisfy the check for almost any word.
 */
/**
 * This file is not part of what it searches.
 *
 * It has to contain names the repository no longer has: the fixtures that
 * prove `withoutComments` strips a deleted symbol out of a doc comment are
 * written around `formatProjectTags`, the very name this check was created
 * for after the README described it for three merges past its deletion.
 * Two of those fixtures are regex literals — `/formatProjectTags/` — which
 * are neither comment nor string, so no amount of stripping reaches them.
 *
 * The result was a guard defeated by its own fixture, for the one symbol it
 * was built around: put that name back in the README and the check stayed
 * green. A guard's fixtures are not evidence about the repository.
 */
const OWN_FIXTURES = "tests/repository-docs.test.ts";

const codeWithoutComments = allEntries
  .filter((f) => /\.tsx?$/.test(f) || f.endsWith(".claude/settings.json"))
  .filter((f) => !f.endsWith(OWN_FIXTURES))
  .map((f) => withoutComments(readFileSync(f, "utf8")))
  .join("\n");

/**
 * Anything backticked that reads as a path or a filename.
 *
 * The extension list is the check's reach. It held only source and config
 * formats, so `src/index.css` and `.claude/hooks/session-start.sh` were
 * named in the documents and never verified — renaming either to something
 * that does not exist left every test green.
 */
function pathsNamedIn(document: string): string[] {
  return [
    ...new Set(
      [...document.matchAll(/`([\w@./-]*[\w-]\.(?:tsx?|jsx?|json|ya?ml|xml|md|css|html|sh)|[\w./-]+\/)`/g)].map(
        (m) => m[1],
      ),
    ),
  ];
}

/**
 * Which of those the repository has nothing matching.
 *
 * Matched as a suffix, since the documents abbreviate some paths
 * ("utils/domain.ts") and generalise others (".stories.tsx").
 */
function pathsThatDoNotExist(named: string[]): string[] {
  return named.filter((quoted) => {
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
}

const quotedPaths = pathsNamedIn(readme);

/** Backticked camelCase names: a lower-case start with a capital inside. */
const quotedIdentifiers = [
  ...new Set(
    [...readme.matchAll(/`([a-z][a-zA-Z0-9]*)`/g)]
      .map((m) => m[1])
      .filter((name) => /[A-Z]/.test(name)),
  ),
];

/**
 * Backticked PascalCase names: components, types and story exports.
 *
 * This half was missing, and two names rotted behind it. The README claimed
 * stories called `ErrorState` and `EmptyState` that no story has ever
 * exported, and the check above could not see them because it only matched
 * names beginning with a lower-case letter.
 */
const quotedComponents = [
  ...new Set([...readme.matchAll(/`([A-Z][a-zA-Z0-9]*)`/g)].map((m) => m[1])),
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

  it("keeps the tail of a line carrying a regex with a slash in it", () => {
    // The two regular expressions this replaced could not tell a comment
    // from a `//` inside something else, so everything after `/x\//` was
    // deleted. Live on four lines of this repository, and a false green
    // waiting for the first undeclared import to land on one of them.
    // The marker is not written as an import. It was, and the dependency
    // gate immediately reported an undeclared package imported by this
    // file — correctly, because a corrected stripper stopped eating the
    // tail and the forged import became visible. A fixture that plants
    // code in a repository that scans for code is the thing this whole
    // class is about.
    const source = String.raw`const rx = /x\//; const survivedTheRegex = 1;`;

    expect(withoutComments(source)).toContain("survivedTheRegex");
  });

  it("keeps the tail of a line carrying a string with a slash pair in it", () => {
    const source = 'const p = "a//b"; const survivedTheString = 1;';

    expect(withoutComments(source)).toContain("survivedTheString");
  });

  it("does not let a string open a block comment", () => {
    // `"a /* b"` swallowed every line up to the next real close, imports
    // included.
    const source = 'const s = "a /* b"; const survivedTheBlock = 1;';

    expect(withoutComments(source)).toContain("survivedTheBlock");
  });

  it("removes a comment glued to a closing quote", () => {
    // The old rule ignored a slash preceded by a quote, so this survived
    // stripping and the import graph read `./orphan` out of a comment.
    const source = 'const a = "x"// import { Foo } from "./orphan";';

    expect(withoutComments(source)).not.toContain("orphan");
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
    const missing = pathsThatDoNotExist(quotedPaths);

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

  it("names only components, types and stories the code still exports", () => {
    const missing = quotedComponents.filter(
      (name) => !new RegExp(`\\b${name}\\b`).test(codeWithoutComments),
    );

    expect(quotedComponents.length).toBeGreaterThan(5);
    expect(
      missing,
      `the README describes these, and nothing in the code is called that:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("reads real source, so none of the checks above pass vacuously", () => {
    // A broken root would leave both haystacks empty and let anything through.
    expect(allEntries.length).toBeGreaterThan(50);
    expect(codeWithoutComments).toContain("getYearsOfExperience");
    expect(codeWithoutComments).toContain("PageSection");
  });

  it("does not read its own fixtures as evidence about the repository", () => {
    // formatProjectTags was deleted, and this file names it four times to
    // prove the comment stripper reaches it — twice inside regex literals,
    // which no stripper touches. While those counted, the check written
    // after the README described that symbol for three merges past its
    // deletion would have passed on the README describing it again.
    expect(codeWithoutComments).not.toContain("formatProjectTags");
  });
});

/**
 * The documents that govern the work, with where each one lives. CLAUDE.md
 * sits at the root and is the first thing read in a session, which makes a
 * stale path in it the most expensive kind: it sends the next contributor to
 * write in a file that does not exist before they have read anything else.
 */
const GUIDELINE_DOCUMENTS: Record<string, string> = {
  "WAYS_OF_WORKING.md": "docs/guidelines",
  "AI_INSTRUCTIONS.md": "docs/guidelines",
  "CLAUDE.md": ".",
};

describe("guideline documents", () => {
  it("keeps every guideline document present and non-empty", () => {
    Object.entries(GUIDELINE_DOCUMENTS).forEach(([file, dir]) => {
      const path = resolve(root, dir, file);
      expect(existsSync(path), `${file} is missing`).toBe(true);
      expect(readFileSync(path, "utf8").trim().length).toBeGreaterThan(0);
    });
  });

  /**
   * The same check the README gets, and for a stronger reason: this is the
   * document that tells the next contributor where things live, so a path
   * it names that no longer exists sends them to write in the wrong file.
   *
   * Until now these two were only checked for existing and being non-empty.
   * That let AI_INSTRUCTIONS point at `src/assets/`, a directory this
   * repository has never had.
   */
  it("names only files that exist", () => {
    const named = Object.entries(GUIDELINE_DOCUMENTS).flatMap(([file, dir]) =>
      pathsNamedIn(readFileSync(resolve(root, dir, file), "utf8")).map((path) => ({
        file,
        path,
      })),
    );

    const missing = named.filter(({ path }) => pathsThatDoNotExist([path]).length > 0);

    // Guards against the extraction quietly finding nothing, which would
    // make the check pass on any document at all.
    expect(named.length).toBeGreaterThan(5);
    expect(
      missing.map(({ file, path }) => `${file}: ${path}`),
      "these are named in the guidelines, and nothing in the repository matches",
    ).toEqual([]);
  });
});

/**
 * Citations of a governing document, by name and part.
 *
 * Renaming ENGINEERING_PRINCIPLES.md to WAYS_OF_WORKING.md left four of
 * these behind — in `scripts/lighthouse.ts`, `tests/dependencies.test.ts`,
 * `tests/module-reachability.test.ts` and this file — and nothing turned
 * red. The path check above only sees a backticked path and the symbol
 * check only sees an identifier; a document cited in prose is neither, so
 * the rename looked complete while four comments pointed at a file that no
 * longer existed.
 *
 * Cheap to hold: a citation names a document that governs the work, and
 * there are only two of those.
 */
const CITATION = /([A-Za-z][A-Za-z ]{2,40}),\s+(?:section|Part)\s+\d+/g;

const GOVERNING_TITLES = ["Ways of Working", "AI Instructions"];

describe("citations of a governing document", () => {
  const cited = allEntries
    .filter((f) => /\.(tsx?|md)$/.test(f))
    .flatMap((f) =>
      [...readFileSync(f, "utf8").matchAll(CITATION)].map((m) => ({
        file: f.replace(`${root}/`, ""),
        title: m[1].trim(),
      })),
    );

  it("finds the citations it is checking, so this cannot pass vacuously", () => {
    expect(cited.length).toBeGreaterThan(2);
  });

  it("names a document that still governs the work", () => {
    const stale = cited.filter(({ title }) => !GOVERNING_TITLES.includes(title));

    expect(
      stale.map(({ file, title }) => `${file}: "${title}"`),
      "these cite a governing document by a name nothing goes by any more",
    ).toEqual([]);
  });
});

/**
 * The backlog gets the same treatment, and needs it more than most.
 *
 * Its whole value is that picking an item up costs nothing, and that rests
 * entirely on the file and component names in it still meaning something. An
 * item pointing at a path that has since been renamed is worse than no item:
 * it reads as understood work right up until someone tries to start it.
 */
const backlog = readFileSync(resolve(root, "docs/BACKLOG.md"), "utf8");

describe("the backlog", () => {
  it("names only files that exist", () => {
    const named = pathsNamedIn(backlog);
    const missing = pathsThatDoNotExist(named);

    expect(named.length).toBeGreaterThan(2);
    expect(
      missing,
      `the backlog points at these, and nothing in the repository matches:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("names only components and hooks the code still has", () => {
    const named = [
      ...new Set(
        [...backlog.matchAll(/`([a-zA-Z][a-zA-Z0-9]*)`/g)]
          .map((m) => m[1])
          .filter((name) => /[A-Z]/.test(name)),
      ),
    ];
    const missing = named.filter(
      (name) => !new RegExp(`\\b${name}\\b`).test(codeWithoutComments),
    );

    expect(named.length).toBeGreaterThan(3);
    expect(
      missing,
      `the backlog describes these, and nothing in the code is called that:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });
});

/**
 * Every ratchet is written down somewhere, which two documents already
 * claimed and nothing checked.
 *
 * CLAUDE.md says the README's list is the current one and casts it as this
 * repository's decisions log; AI_INSTRUCTIONS.md says the same. Thirteen of
 * the twenty-eight files in `tests/` were named in none of the three — among
 * them the guard on this README's own banner dimensions, the one holding
 * `index.html` to the sentence in the served privacy policy, and the one
 * holding the profile crawlers read to the data the page renders. So the gap
 * was in the memory and not only in a README: what broke, why the guard
 * exists and what was rejected is exactly what a list like that is for, and
 * for those thirteen it lived in a doc comment nobody would think to open.
 *
 * `tests/` is the right unit to hold to this. It is where this repository
 * puts the checks that hold a shipped artifact against a source of truth,
 * as opposed to the unit tests that sit beside their subject under `src/`.
 * There is no exemption list, deliberately: a fast half of a browser gate
 * belongs in the entry for that gate, which is where the four of them are
 * named now, and a list of files that need not be written down is the
 * beginning of the same drift.
 */
describe("the claim that every ratchet is written down", () => {
  const documents = [
    "README.md",
    "docs/guidelines/AI_INSTRUCTIONS.md",
    "CLAUDE.md",
  ].map((file) => readFileSync(resolve(root, file), "utf8"));

  const guards = allEntries
    .map((file) => relative(root, file).replace(/\\/g, "/"))
    .filter((file) => /^tests\/.+\.tsx?$/.test(file) && file.includes(".test."));

  it("finds the guards it is checking, so this cannot pass vacuously", () => {
    expect(guards.length).toBeGreaterThan(20);
  });

  it("holds for every check in tests/", () => {
    const unwritten = guards.filter(
      (file) => !documents.some((text) => text.includes(file)),
    );

    expect(
      unwritten,
      `these hold something to something and no document says so:\n  ${unwritten.join("\n  ")}\n\n` +
        `Add an entry to the README's list under Development Guidelines and Guardrails saying what ` +
        `broke, why the guard exists and what was rejected — or name the file inside the entry for ` +
        `the gate it is the fast half of. CLAUDE.md calls that list this repository's decisions log, ` +
        `so a guard missing from it is a decision nobody recorded.`,
    ).toEqual([]);
  });
});
