/**
 * Exports nothing refers to.
 *
 * Both reachability ratchets work at the level of a module: they ask whether
 * anything imports the file. An export inside a file that *is* imported, and
 * that nothing anywhere mentions, is invisible to them — a walk-termination
 * helper lived in `scripts/focusIndicator.ts` with four tests under the
 * heading "walking the tab order" while the sweep that actually runs never
 * called it, and every one of those tests was green.
 *
 * This asks a narrower question than that story wants, and the narrowing is
 * deliberate. Measured across 231 exports: 85 have no consumer outside the
 * file that declares them, and almost all of those are legitimate. Thirty-
 * seven are types, which cost nothing at runtime and state a component's
 * contract. Thirty-two are units a module split out so a test could reach
 * them and then calls itself two lines down. Nine are gate logic or test
 * infrastructure, whose consumers are gates and tests by construction —
 * `scrollLockHolders` says so in its own doc comment.
 *
 * What is left, and what this reports, is the case with no argument on its
 * side: a value carrying `export` that nothing refers to anywhere, not even
 * a test. Seven of those, and each is a keyword that can go.
 *
 * The honest limit, recorded rather than glossed: this would not have caught
 * the helper above. That one had tests, so something referred to it. Telling
 * "tested and used by the gate" from "tested and used by nothing" needs to
 * know whether a runner calls it, and the same module's other exports are
 * read by the same tests and by no runner while being entirely legitimate.
 * There is no structural line there, so the class stays held by reading, and
 * `docs/BACKLOG.md` says so.
 */

/** One exported name, and how often the program mentions it. */
export interface ExportedSymbol {
  name: string;
  /** Repository-relative, for the report. */
  file: string;
  /** True for an interface or a type alias, which this does not judge. */
  typeOnly: boolean;
  /**
   * How many files other than this one write the name.
   *
   * Counted from the compiler's identifiers rather than from the text. A
   * text scan reads prose: `PLAUSIBLE_INK` appears in a comment in
   * `scripts/runPrintCheck.ts` explaining what holds a number honest, and
   * `grep -rl` calls that file a consumer while the compiler does not.
   *
   * Files rather than occurrences, and other files rather than all of them,
   * because the question is whether the `export` earns itself. A constant a
   * module declares and uses two lines down needs no keyword; one a test
   * reaches for does.
   */
  elsewhere: number;
}

/**
 * Exports the code carries and never names again, with the reason.
 *
 * Empty, and the type admits nothing without a reason. An entry here says a
 * name is exported deliberately for something outside the program's own
 * references — a public surface, a re-export someone else consumes — and
 * this repository ships no such thing today.
 */
export const EXPORTED_ON_PURPOSE: Record<string, string> = {};

export interface Unused {
  name: string;
  file: string;
}

/**
 * A value's `export` is unearned when no other file writes the name.
 *
 * Types are left alone: an unimported prop type costs nothing at runtime and
 * says what a component takes, which is a reason to keep it that a value
 * nothing outside its module refers to does not have.
 */
export function unusedExports(
  symbols: ExportedSymbol[],
  exempt: Record<string, string> = EXPORTED_ON_PURPOSE,
): Unused[] {
  return symbols
    .filter((symbol) => !symbol.typeOnly)
    // A default export is named by whoever imports it, so counting the
    // times anything writes `default` answers a different question and
    // answers it zero. Whether such a module is reached at all is what
    // tests/module-reachability.test.ts and tests/wiring.test.ts ask.
    .filter((symbol) => symbol.name !== "default")
    .filter((symbol) => !(symbol.name in exempt))
    .filter((symbol) => symbol.elsewhere === 0)
    .map(({ name, file }) => ({ name, file }));
}

/** Entries in the exemption list that name nothing the code exports. */
export function staleExemptions(
  symbols: ExportedSymbol[],
  exempt: Record<string, string> = EXPORTED_ON_PURPOSE,
): string[] {
  const present = new Set(symbols.map((symbol) => symbol.name));
  return Object.keys(exempt).filter((name) => !present.has(name));
}
