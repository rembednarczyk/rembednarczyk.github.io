import { relative, resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  EXPORTED_ON_PURPOSE,
  staleExemptions,
  unusedExports,
  type ExportedSymbol,
} from "../scripts/exportUse";

/**
 * The compiler's view of what refers to what, rather than a text scan.
 *
 * The backlog asked for exactly this and it turned out to matter in the
 * first measurement: `PLAUSIBLE_INK` is mentioned in `scripts/runPrintCheck.ts`
 * inside a comment explaining what holds a number honest, and grep counts
 * that as a consumer. The compiler counts identifiers, so it does not.
 *
 * Building the program costs a few seconds, which is why this is one test
 * file rather than a check bolted onto several.
 */

const root = resolve(__dirname, "..");

const relative_ = (file: string) => relative(root, file).replace(/\\/g, "/");

const isTest = (file: string) =>
  /\.(test|spec|stories)\.tsx?$/.test(file) || relative_(file).startsWith("tests/");

/** Files whose exports are worth asking about: the app and the scripts. */
const declaresExports = (file: string) => {
  const path = relative_(file);
  if (isTest(file) || file.includes("node_modules") || path.endsWith(".d.ts")) return false;
  return path.startsWith("src/") || path.startsWith("scripts/");
};

/**
 * Every name written as code in a file, which is not every name in it.
 *
 * Identifiers, from the compiler's own tree. Prose is not code: a comment
 * saying what a constant is for mentions its name and refers to nothing.
 */
function namesWritten(source: ts.SourceFile): Set<string> {
  const names = new Set<string>();

  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node)) names.add(node.text);
    ts.forEachChild(node, visit);
  };

  visit(source);
  return names;
}

function readProgram(): ExportedSymbol[] {
  const parsed = ts.parseJsonConfigFileContent(
    ts.readConfigFile(resolve(root, "tsconfig.json"), ts.sys.readFile).config,
    ts.sys,
    root,
  );

  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();

  /** Which files write each name, so a module's own use can be told apart. */
  const writtenIn = new Map<string, Set<string>>();

  for (const source of program.getSourceFiles()) {
    if (source.fileName.includes("node_modules") || source.fileName.endsWith(".d.ts")) continue;

    for (const name of namesWritten(source)) {
      if (!writtenIn.has(name)) writtenIn.set(name, new Set());
      writtenIn.get(name)!.add(source.fileName);
    }
  }

  const symbols: ExportedSymbol[] = [];

  for (const source of program.getSourceFiles()) {
    if (!declaresExports(source.fileName)) continue;

    const moduleSymbol = checker.getSymbolAtLocation(source);
    if (!moduleSymbol) continue;

    for (const item of checker.getExportsOfModule(moduleSymbol)) {
      const declaration = item.declarations?.[0];
      if (!declaration) continue;

      symbols.push({
        name: item.getName(),
        file: relative_(source.fileName),
        typeOnly:
          ts.isInterfaceDeclaration(declaration) || ts.isTypeAliasDeclaration(declaration),
        elsewhere: [...(writtenIn.get(item.getName()) ?? [])].filter(
          (where) => where !== source.fileName,
        ).length,
      });
    }
  }

  return symbols;
}

const symbols = readProgram();

describe("what the program refers to", () => {
  it("finds the exports it is checking, so none of this passes vacuously", () => {
    // Building a program against the wrong config, or against no files, is
    // the way this check quietly becomes no check: it would report nothing
    // unused because it would have found nothing at all.
    expect(symbols.length).toBeGreaterThan(150);
    expect(symbols.some((symbol) => symbol.name === "withoutComments")).toBe(true);
    expect(symbols.some((symbol) => symbol.typeOnly)).toBe(true);
  });

  it("counts the other files that write a shared name", () => {
    const shared = symbols.find((symbol) => symbol.name === "withoutComments");

    expect(shared?.elsewhere).toBeGreaterThan(1);
  });

  it("does not count a name that appears only in prose", () => {
    // The reason the backlog asked for the compiler rather than a text scan,
    // and it landed on the first measurement this check ever took:
    // `scripts/runPrintCheck.ts` said "what holds the number honest is not
    // this line but PLAUSIBLE_INK" in a comment, and `grep -rl` reported
    // that file as a consumer of a constant it never refers to.
    //
    // Asserted against a file written here rather than against the
    // repository, which was the first attempt: it keyed on PLAUSIBLE_INK
    // still being exported, and the very cleanup this check asked for took
    // the keyword off, so the guard for the rule broke on the rule being
    // followed.
    const fixture = ts.createSourceFile(
      "fixture.ts",
      "// FROM_A_COMMENT is what holds it honest\nconst writtenAsCode = 1;\n",
      ts.ScriptTarget.Latest,
      true,
    );

    expect([...namesWritten(fixture)]).toContain("writtenAsCode");
    expect([...namesWritten(fixture)]).not.toContain("FROM_A_COMMENT");
  });
});

describe("deciding which exports are unused", () => {
  const symbol = (over: Partial<ExportedSymbol> = {}): ExportedSymbol => ({
    name: "helper",
    file: "src/lib/thing.ts",
    typeOnly: false,
    elsewhere: 2,
    ...over,
  });

  it("reports a value whose only mention is its own declaration", () => {
    expect(unusedExports([symbol({ elsewhere: 0 })])).toEqual([
      { name: "helper", file: "src/lib/thing.ts" },
    ]);
  });

  it("leaves a value something refers to", () => {
    expect(unusedExports([symbol({ elsewhere: 1 })])).toEqual([]);
  });

  it("leaves a type alone whatever its count", () => {
    // An unimported prop type costs nothing at runtime and states what a
    // component takes. A function nobody calls has no such argument, and
    // conflating the two would put 37 entries on an exemption list.
    expect(unusedExports([symbol({ typeOnly: true, elsewhere: 0 })])).toEqual([]);
  });

  it("leaves a default export alone, which nothing names by that word", () => {
    // `export default App` is imported under whatever name the other side
    // picks, so counting the files that write `default` answers a different
    // question. Asserted here rather than against the repository, where it
    // happens to be moot: something writes `.default` as a property, which
    // gives every default export a count it did not earn. Take this filter
    // out and nothing in the repository turns red today — which is exactly
    // why the guard for it cannot live there.
    expect(unusedExports([symbol({ name: "default", elsewhere: 0 })])).toEqual([]);
  });

  it("honours an exemption, and only while the export is there", () => {
    const pretend = { helper: "a reason long enough to count as one" };

    expect(unusedExports([symbol({ elsewhere: 0 })], pretend)).toEqual([]);
    expect(staleExemptions([symbol({ name: "other" })], pretend)).toEqual(["helper"]);
    expect(staleExemptions([symbol()], pretend)).toEqual([]);
  });
});

describe("the exports this repository carries", () => {
  it("names every one of them somewhere else", () => {
    const unused = unusedExports(symbols);

    expect(
      unused.map(({ file, name }) => `${file}: ${name}`),
      "these carry `export` and nothing in the program ever names them again, " +
        "so the keyword can go:\n  " +
        unused.map(({ file, name }) => `${file}: ${name}`).join("\n  "),
    ).toEqual([]);
  });

  it("carries no exemption for an export that has gone", () => {
    expect(staleExemptions(symbols)).toEqual([]);
  });

  it("gives a reason for every exemption", () => {
    for (const [name, reason] of Object.entries(EXPORTED_ON_PURPOSE)) {
      expect(reason.length, `${name} is exempt and says nothing about why`).toBeGreaterThan(30);
    }
  });
});
