import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Portfolio } from "../src/App";
import { MotionProvider } from "../src/components/MotionProvider";
import { PAGE_BODIES, pageBodyOf } from "../src/components/PageBodies";
import { NAV_ITEMS } from "../src/data/navigation";
import { numbered } from "../src/lib/pageLayout";
import pageLayout from "../src/content/pageLayout.json" with { type: "json" };

/**
 * The page's shape, held the way the printed CV's is.
 *
 * Thirteen bands were thirteen calls in App.tsx and their headings were
 * typed inside the ten components that had one. The order, the headings and
 * which bands exist are content now, and what any one of them draws is not
 * — a grid of expertise cards and a contact form are not two arrangements
 * of one thing.
 *
 * The numbers are the interesting part, and they are not in the content.
 * `number="01"` through `number="10"` were written by hand in ten separate
 * files and nothing held the ten to each other. Measured before this
 * existed: two bands could both carry `03`, or one could carry `14` out of
 * a run of ten, with tsc green and all 602 tests green — and inserting a
 * band meant renumbering every band below it by hand.
 *
 * A guard on that would have been the obvious answer and the weaker one.
 * The number is read off the position instead, so it cannot disagree with
 * the position: the defect stops being caught and becomes unsayable. What
 * is left to check is that the derivation is the one the page had, and that
 * the navigation still points at bands that exist.
 */

vi.mock("../src/components/ParticleBackground", () => ({ ParticleBackground: () => null }));

const page = () =>
  render(
    <MotionProvider>
      <Portfolio />
    </MotionProvider>,
  );

describe("the layout the page is drawn from", () => {
  it("names bands to check, so nothing below passes vacuously", () => {
    expect(pageLayout.sections.length).toBe(13);
    expect(PAGE_BODIES.length).toBe(13);
  });

  it("asks only for bands the page can draw", () => {
    const undrawable = pageLayout.sections
      .map((section) => section.body)
      .filter((body) => !PAGE_BODIES.includes(body));

    expect(
      undrawable,
      `the layout asks for these and PageBodies draws none of them:\n  ${undrawable.join("\n  ")}`,
    ).toEqual([]);
  });

  it("leaves no band the page can draw that the layout never asks for", () => {
    // Invisible to lint, which sees the registry using every import.
    const unused = PAGE_BODIES.filter(
      (body) => !pageLayout.sections.some((section) => section.body === body),
    );

    expect(
      unused,
      `PageBodies draws these and no layout entry asks for them:\n  ${unused.join("\n  ")}`,
    ).toEqual([]);
  });

  it("names each band once", () => {
    const named = pageLayout.sections.map((section) => section.body);

    expect(named).toEqual([...new Set(named)]);
  });
});

describe("a band nothing draws", () => {
  it("throws rather than leaving a heading with nothing under it", () => {
    expect(() => pageBodyOf("testimonials")).toThrow(/testimonials/);
  });

  it("says what the page could have drawn instead", () => {
    expect(() => pageBodyOf("testimonials")).toThrow(/expertise/);
  });
});

describe("the numbers the page shows", () => {
  it("run 01 upward with no gap and no repeat, whatever the layout says", () => {
    const shown = numbered(pageLayout.sections)
      .filter(({ number }) => number !== "")
      .map(({ number }) => number);

    expect(shown).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
  });

  it("follow the order rather than the entry, so an insertion renumbers itself", () => {
    // The property that replaced ten hand-typed strings. A band inserted
    // third takes 03 and pushes the rest down, with nothing edited.
    const inserted = [
      { body: "hero" },
      { body: "a", id: "a", title: "A" },
      { body: "b", id: "b", title: "B" },
      { body: "c", id: "c", title: "C" },
    ];

    expect(numbered(inserted).map(({ number }) => number)).toEqual(["", "01", "02", "03"]);
  });

  it("give no number to a band that has no heading", () => {
    const unnumbered = numbered(pageLayout.sections)
      .filter(({ section }) => !("title" in section))
      .map(({ number }) => number);

    expect(unnumbered).toEqual(["", "", ""]);
  });

  it("are what the page actually prints", () => {
    // Read off the document, because everything above is arithmetic on the
    // content and none of it says the page renders the result.
    const { container } = render(
      <MotionProvider>
        <Portfolio />
      </MotionProvider>,
    );

    const printed = [...container.querySelectorAll("section[id] h2")]
      .map((node) => /^(\d{2})/.exec((node.textContent ?? "").trim())?.[1])
      .filter((n): n is string => n !== undefined);

    expect(printed).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
  });
});

describe("the navigation and the layout", () => {
  it("scroll to bands the layout actually has", () => {
    // NAV_ITEMS names an anchor per entry and a covered anchor per
    // sub-section. A name that no band carries is a link that goes nowhere,
    // and nothing said so: the layout and the navigation are two lists.
    const anchors = new Set(
      pageLayout.sections.flatMap((section) => ("id" in section ? [section.id] : [])),
    );

    const dangling = NAV_ITEMS.flatMap((item) => [item.id, ...(item.covers ?? [])]).filter(
      (id) => !anchors.has(id) && id !== "contact",
    );

    expect(
      dangling,
      `the navigation scrolls to these and no band carries them:\n  ${dangling.join("\n  ")}`,
    ).toEqual([]);
  });

  it("finds every one of those anchors in the rendered page", () => {
    const { container } = page();

    const missing = [...NAV_ITEMS.flatMap((item) => [item.id, ...(item.covers ?? [])])].filter(
      (id) => container.querySelector(`#${id}`) === null,
    );

    expect(missing).toEqual([]);
  });
});
