/**
 * Source with its comments taken out, before anything searches it.
 *
 * This repository writes comments that name modules and describe their
 * removal, which makes prose that reads exactly like code to a regular
 * expression. It has already been bitten twice.
 *
 * Once in the documentation gate: the README described `formatProjectTags`
 * as "covered by tests and called by nothing yet" for three merges after the
 * helper had been deleted, because the only trace of the name left in the
 * repository was the comment recording that it was gone.
 *
 * Once in the dependency gate, whose own doc comment reads *"behind it" from
 * "in front of it"* — and the scanner read that as an import of a package
 * called `in front of\n * it`.
 *
 * Both of those were fixed where they were found, and the import graph, which
 * runs the same three regexes and is what both reachability ratchets read,
 * was not. Two implementations of "what imports what", one hardened against a
 * defect this repository already hit and one not, is the state its own doc
 * comment warns about: "would eventually disagree, at which point one of them
 * would be quietly wrong about the repository it is guarding."
 *
 * The `//` rule ignores a slash preceded by a quote, a colon or a backtick,
 * so a URL inside a string is not mistaken for a comment.
 */
export function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1 ");
}
