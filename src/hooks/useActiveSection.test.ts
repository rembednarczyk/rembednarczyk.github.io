import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useActiveSection } from "./useActiveSection";
import { SECTION_TO_NAV_ENTRY } from "../data/navigation";

/**
 * jsdom performs no layout, so section positions and page height have to
 * be supplied. `scrollHeight` matters: the hook treats "within 50px of the
 * bottom" as a signal to activate the last section, and jsdom reports a
 * height of 0, which would make that branch fire on every check.
 */
function renderSections(sections: { id: string; top: number }[], scrollY = 0) {
  document.body.innerHTML = sections
    .map((s) => `<section id="${s.id}"></section>`)
    .join("");

  sections.forEach(({ id, top }) => {
    const el = document.getElementById(id)!;
    el.getBoundingClientRect = () => ({ top }) as DOMRect;
  });

  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: 100000,
    configurable: true,
  });
  Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });

  return renderHook(() => useActiveSection(SECTION_TO_NAV_ENTRY));
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useActiveSection", () => {
  it("activates the last section scrolled past", async () => {
    const { result } = renderSections([
      { id: "about", top: 0 },
      { id: "skills", top: 100 },
      { id: "contact", top: 9000 },
    ]);

    await waitFor(() => expect(result.current).toBe("skills"));
  });

  // The navbar has one link per group, so sub-sections have to report
  // their parent or the link goes dark while the reader is inside them.
  it.each([
    ["achievements", "experience"],
    ["recognition", "experience"],
    ["brand", "community"],
    ["expertise", "about"],
  ])("reports %s as %s", async (child, parent) => {
    const { result } = renderSections([
      { id: "hero", top: 0 },
      { id: child, top: 100 },
      { id: "contact", top: 9000 },
    ]);

    await waitFor(() => expect(result.current).toBe(parent));
  });

  it("leaves sections that map to themselves alone", async () => {
    const { result } = renderSections([
      { id: "hero", top: 0 },
      { id: "certifications", top: 100 },
      { id: "contact", top: 9000 },
    ]);

    await waitFor(() => expect(result.current).toBe("certifications"));
  });

  it("activates the last section at the bottom of the page", async () => {
    document.body.innerHTML = `<section id="about"></section><section id="contact"></section>`;
    document.querySelectorAll("section").forEach((el) => {
      el.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", { value: 1000, configurable: true });

    const { result } = renderHook(() => useActiveSection(SECTION_TO_NAV_ENTRY));
    await waitFor(() => expect(result.current).toBe("contact"));
  });
});

/**
 * Above the first section the reader is in the hero, which has no nav
 * entry. The hook only assigned when a section qualified, so whatever was
 * last active stayed lit: scrolling down to Experience and back to the top
 * left the navbar claiming the reader was still in Experience.
 */
describe("above the first section", () => {
  it("reports nothing while the reader is in the hero", async () => {
    const { result } = renderSections([
      { id: "about", top: 800 },
      { id: "skills", top: 1600 },
    ]);

    await waitFor(() => expect(result.current).toBe(""));
  });

  it("clears the highlight on the way back up", async () => {
    // The regression itself: down first, then back above everything.
    const { result } = renderSections(
      [
        { id: "about", top: -1000 },
        { id: "skills", top: -200 },
      ],
      2000,
    );

    await waitFor(() => expect(result.current).toBe("skills"));

    document.getElementById("about")!.getBoundingClientRect = () =>
      ({ top: 800 }) as DOMRect;
    document.getElementById("skills")!.getBoundingClientRect = () =>
      ({ top: 1600 }) as DOMRect;
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    window.dispatchEvent(new Event("scroll"));

    await waitFor(() => expect(result.current).toBe(""));
  });
});
