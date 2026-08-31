import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The failures a form produces, which a type system cannot see.
 *
 * There is no JSON Schema here and no validator dependency, and that is a
 * decision rather than an omission. What a schema would buy was measured
 * against what already holds, one broken content file at a time:
 *
 *   a required field removed       tsc fails
 *   a wrong type, string[] to string   tsc fails
 *   an unknown extra key           tests/contentReaches.test.ts fails,
 *                                  because a value nothing renders is a
 *                                  value nobody reads
 *   a bad icon, accent or tone     the registry throws at load
 *   an unknown placeholder         the substitution throws at load
 *
 * That is most of what a schema is for, already enforced, and a second
 * description of the same shapes would be a second thing to keep in step
 * with the first. What none of it catches is content that is the right
 * shape and empty — and those are exactly the edits a form makes: a field
 * cleared, a list emptied, a value pasted with the space that came with it.
 * Measured before this file existed: `hero.name` set to `""` left the
 * page's `h1` blank, `about.paragraphs` set to `[]` emptied a whole
 * section, and both passed tsc and all 591 tests.
 *
 * So four rules over the whole tree, and no per-file description. The rules
 * are universal on purpose: a new content file is covered the day it is
 * added, with nobody remembering to describe it.
 */

const contentDir = resolve(__dirname, "../src/content");

/**
 * The one key whose strings may be whitespace.
 *
 * A contact detail is stored in parts so that rendering it leaves no text
 * node carrying the whole address, and the phone number's parts include
 * three single spaces, which are its grouping — `+48 530 333 243` read
 * aloud rather than twelve digits. tests/contactParts.test.tsx is where
 * that trade is argued; here it only has to be excepted.
 */
const MAY_BE_BLANK = "display";

interface Finding {
  rule: string;
  at: string;
  saw: string;
}

function inspect(value: unknown, at: string, key: string | undefined, found: Finding[]): void {
  if (typeof value === "string") {
    if (key === MAY_BE_BLANK) return;

    if (value.trim() === "") {
      found.push({ rule: "empty string", at, saw: JSON.stringify(value) });
    } else if (value !== value.trim()) {
      found.push({ rule: "untrimmed string", at, saw: JSON.stringify(value) });
    }
    return;
  }

  if (typeof value === "number") {
    if (!(value > 0)) found.push({ rule: "number that is not positive", at, saw: String(value) });
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) found.push({ rule: "empty list", at, saw: "[]" });
    value.forEach((item, index) => inspect(item, `${at}[${index}]`, key, found));
    return;
  }

  if (value !== null && typeof value === "object") {
    for (const [name, item] of Object.entries(value)) inspect(item, `${at}.${name}`, name, found);
  }
}

const files = readdirSync(contentDir).filter((entry) => entry.endsWith(".json"));

const findings = files.flatMap((file) => {
  const found: Finding[] = [];
  inspect(JSON.parse(readFileSync(resolve(contentDir, file), "utf8")), file, undefined, found);
  return found;
});

const say = (found: Finding[]) =>
  found.map(({ rule, at, saw }) => `${at}: ${rule} ${saw}`).join("\n  ");

describe("every value in src/content", () => {
  it("is read from files, so the checks below are not vacuous", () => {
    // A walk over nothing reports nothing and looks exactly like a pass.
    expect(files.length).toBeGreaterThan(10);

    const seen: Finding[] = [];
    inspect({ a: "", b: [], c: 0, d: " x " }, "fixture", undefined, seen);
    expect(seen.map((f) => f.rule)).toEqual([
      "empty string",
      "empty list",
      "number that is not positive",
      "untrimmed string",
    ]);
  });

  it("says something, is a list with something in it, or is a positive number", () => {
    expect(
      findings,
      `these would ship as a blank heading, an empty section or a stray space, and nothing else reports them:\n  ${say(findings)}`,
    ).toEqual([]);
  });
});

describe("the one exception", () => {
  it("is the contact parts, and it is being used", () => {
    // A guard on the exemption: if the phone number stopped being stored in
    // parts, this would be an exception protecting nothing, and the rules
    // above would silently be narrower than they look.
    const cv = JSON.parse(readFileSync(resolve(contentDir, "cv.json"), "utf8")) as {
      header: { phone: { display: string[] } };
    };

    expect(cv.header.phone.display.filter((part) => part.trim() === "")).toHaveLength(3);
  });

  it("does not stretch past that key", () => {
    // The exemption is by key name, so it would apply to any `display`
    // anywhere. Measured: there is one, and it is the contact detail's.
    const others = files.filter((file) => {
      const text = readFileSync(resolve(contentDir, file), "utf8");
      return file !== "cv.json" && text.includes(`"${MAY_BE_BLANK}"`);
    });

    expect(
      others,
      `these also carry a ${MAY_BE_BLANK} key, so the blank-string exception now covers them too:\n  ${others.join("\n  ")}`,
    ).toEqual([]);
  });
});
