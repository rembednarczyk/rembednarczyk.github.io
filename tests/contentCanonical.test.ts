import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The bytes an editor writes back are the bytes on disk.
 *
 * `src/content` is no longer written only by hand. The editor at
 * `editor_remigiuszbednarczyk.com` reads a file through GitHub's Contents API,
 * parses it, edits one field and commits it back as
 * `JSON.stringify(value, null, 2) + "\n"` — so that serialization, and no
 * other, is what a saved file looks like.
 *
 * Three of the sixteen files were authored in a style it does not reproduce.
 * `certifications.json` stored every non-ASCII character as a `\uXXXX` escape
 * — `Certified SAFe® 6 Agilist`, `Barbara Smoczyńska` — where the
 * serializer emits raw UTF-8. `cvLayout.json` and `pageLayout.json` kept their
 * section entries hand-compacted onto one line each, where it expands every
 * object. Measured before this guard existed: editing one field in
 * `pageLayout.json` rewrote 62 of its 64 lines, and `cvLayout.json` 38 of 40 —
 * the intended one-field change buried inside a whole-file reformat.
 *
 * Nothing caught it, and nothing could. The *value* never changed: same
 * strings, same key order, same numbers. So `tests/contentShape.test.ts` was
 * green because it reads values, `tests/contentReaches.test.ts` was green
 * because it reads values, and `tsc` was green because the types never moved.
 * The defect lived entirely in the bytes, which is the one thing this
 * repository says must not change by accident — a diff nobody typed, riding
 * in on the first edit somebody did type.
 *
 * So the rule is stated rather than assumed: every content file already is
 * what the editor would write. A file authored in another style now fails
 * here, at the moment it is added, instead of on an owner's first save.
 *
 * Two things rejected. Teaching the editor to preserve each file's original
 * style: it would have to model escaping and compaction per file, and the two
 * writers would still disagree the first time a file arrived in a third style
 * — the fix belongs where there is one answer, not two. And a formatter
 * dependency over JSON (Prettier and friends): a second description of the
 * same rule, to be kept in step with the serializer that actually writes these
 * files, where this is one expression of that serializer itself.
 */

const contentDir = resolve(__dirname, "../src/content");

/** What the editor writes for a given document — the one canonical form. */
function asEditorWouldWrite(text: string): string {
  return `${JSON.stringify(JSON.parse(text), null, 2)}\n`;
}

const files = readdirSync(contentDir)
  .filter((name) => name.endsWith(".json"))
  .sort();

describe("every file in src/content", () => {
  it("is found, so the check below cannot pass vacuously", () => {
    // The gap this closes was three files wide; a glob that matched nothing
    // would report the same green as a tree that is entirely canonical.
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files)(
    "%s is already the bytes the editor would commit",
    (name) => {
      const text = readFileSync(resolve(contentDir, name), "utf8");

      expect(
        text,
        `${name} is not in the form the editor writes, so the first edit made ` +
          `through it will commit a whole-file reformat alongside the intended ` +
          `change. Rewrite it as JSON.stringify(value, null, 2) + "\\n": raw ` +
          `UTF-8 rather than \\uXXXX escapes, one key per line, two-space ` +
          `indent, one trailing newline.`,
      ).toBe(asEditorWouldWrite(text));
    },
  );
});
