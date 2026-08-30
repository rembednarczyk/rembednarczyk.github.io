import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The printed CV wrote out seven headed sections, and all seven were
 * identical: the same two print rules on the section, the same nine classes
 * and icon slot on the heading. Identical is the good case and the fragile
 * one — the next hand to touch one of them is the hand that makes it six
 * and one, on the one page nobody looks at on a screen.
 *
 * `print:break-inside-avoid` is why this matters more here than elsewhere.
 * It keeps a section off two sheets, and it is what the printed CV's shape
 * is made of: a block too tall for the space left moves whole and leaves the
 * foot blank. scripts/runPrintCheck.ts records that shape, so dropping the
 * rule from one section would be caught — but only after the layout had
 * already changed. This catches the copy instead.
 */

const root = resolve(__dirname, "..");
const template = readFileSync(resolve(root, "src/components/CVTemplate.tsx"), "utf8");
const shell = readFileSync(resolve(root, "src/components/CvSection.tsx"), "utf8");

describe("the printed CV's headed sections", () => {
  it("are all built by the one shell", () => {
    const built = [...template.matchAll(/<CvSection\b/g)].length;

    expect(built, "the CV has seven headed sections").toBe(7);
    expect(template).not.toMatch(/<section\b/);
  });

  it("carries the print rules in that shell, not in seven places", () => {
    // The className, not the file. The doc comment above it explains what
    // `print:break-inside-avoid` costs, and matching the file let a mutation
    // strip the rule from the markup while this assertion still passed on
    // the prose. scripts/runPrintCheck.ts caught that one; this should have.
    const className = /<section className="([^"]*)">/.exec(shell);

    expect(className, "CvSection does not render a section").not.toBeNull();
    expect(className![1]).toContain("print:break-inside-avoid");
    expect(className![1]).toContain("print:mb-6");

    // The rule still appears on individual job and project entries, which
    // are not sections and are meant to keep it. What must not come back is
    // a hand-written section wrapper.
    expect(template).not.toMatch(
      /<section className="mb-8 print:mb-6 print:break-inside-avoid">/,
    );
  });

  it("gives every section a heading and an icon", () => {
    const withoutBoth = [...template.matchAll(/<CvSection([^>]*)>/g)]
      .map((m) => m[1])
      .filter((props) => !props.includes("icon=") || !props.includes("title="));

    expect(withoutBoth).toEqual([]);
  });

  it("keeps the heading itself in one place", () => {
    // Nine classes, written seven times before this.
    const heading = "text-lg font-bold text-slate-800 uppercase tracking-widest";

    expect(shell).toContain(heading);
    expect(template).not.toContain(heading);
  });
});
