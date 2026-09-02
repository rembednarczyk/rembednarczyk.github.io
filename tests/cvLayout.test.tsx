import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CVTemplate } from "../src/components/CVTemplate";
import { bodyOf } from "../src/components/CvBodies";
import { CV_BODY_NAMES } from "../src/data/vocabulary";
import cvLayout from "../src/content/cvLayout.json" with { type: "json" };

/**
 * The printed CV's shape stopped being written out and became data.
 *
 * Its seven sections were seven `<CvSection>` calls in the template, each
 * with its heading and its icon typed beside it, and their order was where
 * they happened to sit in the JSX. All four of those — which sections, in
 * what order, under what heading, with which icon — are the thing the
 * original ask called *defining the CV layout*, and none of them was
 * reachable by anything but an edit to a .tsx file.
 *
 * What did not move is what each section draws. Seven sections render seven
 * genuinely different shapes: a justified paragraph, a grid, a timeline,
 * three flavours of list and a nested list. A shape is code. Content names
 * one by key, and this holds that naming in both directions, for the same
 * reason the icon registry does — a key that resolves to nothing is a
 * section that renders nothing, on the one page nobody looks at on screen.
 *
 * The defect that prompted moving the icons is worth keeping in view,
 * because it is the class the whole content split makes more likely rather
 * than less. The certification groups' icons were chosen by comparing each
 * group's heading against three string literals in the template. Renaming
 * "Core certifications" to "Core Certifications" — one capital, an edit an
 * owner is now invited to make — dropped that icon from the printed CV, and
 * tsc passed and all 595 tests passed. Measured, before this existed.
 */

describe("the layout the printed CV is drawn from", () => {
  it("names sections to check, so nothing below passes vacuously", () => {
    expect(cvLayout.sections.length).toBe(7);
    expect(CV_BODY_NAMES.length).toBe(7);
  });

  it("asks only for shapes the template can draw", () => {
    const undrawable = cvLayout.sections
      .map((section) => section.body)
      .filter((body) => !(CV_BODY_NAMES as readonly string[]).includes(body));

    expect(
      undrawable,
      `the layout asks for these and CvBodies draws none of them, so each is a heading with nothing under it:\n  ${undrawable.join("\n  ")}`,
    ).toEqual([]);
  });

  it("leaves no shape the template can draw that the layout never asks for", () => {
    // The other direction, which nothing else can see: a body left behind
    // after a section was dropped is unreachable code that lint calls used,
    // because the record that holds it is used.
    const unused = (CV_BODY_NAMES as readonly string[]).filter(
      (body) => !cvLayout.sections.some((section) => section.body === body),
    );

    expect(
      unused,
      `CvBodies draws these and no layout entry asks for them:\n  ${unused.join("\n  ")}`,
    ).toEqual([]);
  });

  it("names each shape once, so one cannot quietly replace another", () => {
    const named = cvLayout.sections.map((section) => section.body);

    expect(named).toEqual([...new Set(named)]);
  });
});

describe("a shape nothing draws", () => {
  it("throws rather than leaving an empty heading", () => {
    expect(() => bodyOf("hobbies")).toThrow(/hobbies/);
  });

  it("says what the template could have drawn instead", () => {
    expect(() => bodyOf("hobbies")).toThrow(/passions/);
  });
});

describe("what the layout decides", () => {
  it("is the order the headings appear in", () => {
    // The assertion the move is for: reorder the JSON and the printed CV
    // reorders. Read off the rendered headings rather than the source, so
    // it is the document that is checked and not the intention.
    const { container } = render(<CVTemplate />);

    const headings = [...container.querySelectorAll("section h3, section h2")].map((node) =>
      (node.textContent ?? "").trim(),
    );

    expect(headings).toEqual(cvLayout.sections.map((section) => section.title));
  });
});
