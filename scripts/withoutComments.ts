/**
 * Source with its comments taken out, before anything searches it.
 *
 * This repository writes comments that name modules and describe their
 * removal, which makes prose that reads exactly like code to a regular
 * expression. It has already been bitten three times.
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
 * Once in the import graph, which runs the same three regexes and is what
 * both reachability ratchets read, and which did not have this at all until
 * a sweep found it extracting a specifier from a comment about stripping
 * comments.
 *
 * It scans rather than substitutes. The two regular expressions it used to
 * be could not tell a comment from a `//` inside something else, so the tail
 * of any line carrying a regex literal like `/x\//` or a string like
 * `"a//b"` was deleted — live on four lines of this repository, and a false
 * green waiting for the first undeclared import to land on one of them. The
 * doc comment claimed a URL inside a string was safe; only `://` was, by
 * accident of the character before the slashes.
 */
export function withoutComments(source: string): string {
  let out = "";
  let index = 0;

  /** Where a template literal's `${` nesting is, so its code is not skipped. */
  const templates: number[] = [];

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];

    // A block comment, to its close or to the end.
    if (character === "/" && next === "*") {
      const close = source.indexOf("*/", index + 2);
      out += " ";
      index = close === -1 ? source.length : close + 2;
      continue;
    }

    // A line comment, to the newline, which is kept so line structure holds.
    if (character === "/" && next === "/") {
      const newline = source.indexOf("\n", index);
      out += " ";
      index = newline === -1 ? source.length : newline;
      continue;
    }

    // A quoted string, copied whole. Its contents are not code, but they are
    // not a comment either, and the import scanners need them.
    if (character === '"' || character === "'" || character === "`") {
      const closed = copyString(source, index, character, templates);
      out += closed.text;
      index = closed.index;
      continue;
    }

    // A regular expression literal. Told apart from division by what comes
    // before it: a value cannot be followed by a regex, an operator can.
    if (character === "/" && startsARegex(out)) {
      const closed = copyRegex(source, index);
      out += closed.text;
      index = closed.index;
      continue;
    }

    out += character;
    index += 1;
  }

  return out;
}

/** Copies a quoted run, respecting escapes and a template's `${` holes. */
function copyString(
  source: string,
  start: number,
  quote: string,
  templates: number[],
): { text: string; index: number } {
  let text = source[start];
  let index = start + 1;

  while (index < source.length) {
    const character = source[index];

    if (character === "\\") {
      text += source.slice(index, index + 2);
      index += 2;
      continue;
    }

    if (character === quote) {
      return { text: text + character, index: index + 1 };
    }

    // A newline ends an unterminated quote rather than swallowing the file.
    if (character === "\n" && quote !== "`") {
      return { text, index };
    }

    if (quote === "`" && character === "$" && source[index + 1] === "{") {
      templates.push(index);
      text += "${";
      index += 2;
      continue;
    }

    text += character;
    index += 1;
  }

  return { text, index };
}

/** Copies a regex literal, including a character class holding a slash. */
function copyRegex(source: string, start: number): { text: string; index: number } {
  let text = "/";
  let index = start + 1;
  let inClass = false;

  while (index < source.length) {
    const character = source[index];

    if (character === "\\") {
      text += source.slice(index, index + 2);
      index += 2;
      continue;
    }

    if (character === "\n") return { text, index };
    if (character === "[") inClass = true;
    else if (character === "]") inClass = false;
    else if (character === "/" && !inClass) return { text: text + "/", index: index + 1 };

    text += character;
    index += 1;
  }

  return { text, index };
}

/**
 * Whether a `/` here opens a regex rather than dividing.
 *
 * Decided by the last thing that is not whitespace: after a name, a number,
 * a closing bracket or a closing paren it is division; after anything else —
 * an operator, a comma, an opening bracket, the start of the file — it opens
 * a literal. `)` is called division, which is wrong for `if (x) /re/.test(s)`
 * and right for `(a + b) / c`; the first form does not occur here and the
 * second does.
 */
function startsARegex(before: string): boolean {
  const previous = before.trimEnd().slice(-1);
  return previous === "" || !/[\w$)\]]/.test(previous);
}
