import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { certificationsData, keyProjectsData, skillsData } from "./data/portfolioData";
import { experienceData, yearsOfExperience } from "./data/portfolioFacts";
import { NAV_ITEMS } from "./data/navigation";

// The canvas background needs APIs jsdom does not provide, and it renders
// nothing meaningful to assert on.
vi.mock("./components/ParticleBackground", () => ({
  ParticleBackground: () => null,
}));

/**
 * Read from the shared model rather than restated here. This list used to be
 * a fourth hand-maintained copy of the navigation, alongside the two in the
 * navbar and the roll-up chain in useActiveSection.
 */
const NAV_TARGETS = NAV_ITEMS.map((item) => [item.label, item.id] as const);

// jsdom does not implement scrollIntoView, so it has to be supplied
// before it can be observed.
const scrollIntoView = vi.fn<(arg?: boolean | ScrollIntoViewOptions) => void>();

beforeEach(() => {
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("navigation targets", () => {
  // useScrollToSection looks the id up with getElementById and silently
  // does nothing when it is missing, so a renamed or dropped section id
  // breaks navigation without any error surfacing.
  it.each(NAV_TARGETS)("%s scrolls to an element that exists", async (label, id) => {
    render(<App />);

    expect(document.getElementById(id)).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: label })[0]);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  // useActiveSection highlights the current link by querying
  // `section[id]`. A nav target that is not a section with that id can be
  // scrolled to but will never light up.
  it("exposes every nav target to the scroll spy", () => {
    const { container } = render(<App />);
    const spyable = Array.from(container.querySelectorAll("section[id]")).map(
      (s) => s.id,
    );

    NAV_TARGETS.forEach(([, id]) => expect(spyable).toContain(id));
  });

  // A sub-section named in `covers` that no longer exists breaks the roll-up
  // in silence: the parent link simply stops lighting up while the reader is
  // inside it, and nothing else changes.
  it("rolls up only sub-sections that are on the page", () => {
    const { container } = render(<App />);
    const onPage = Array.from(container.querySelectorAll("section[id]")).map(
      (s) => s.id,
    );

    const covered = NAV_ITEMS.flatMap((item) => item.covers ?? []);
    expect(covered.length).toBeGreaterThan(0);
    covered.forEach((id) => expect(onPage).toContain(id));
  });
});

describe("document structure", () => {
  // Scoped to main: the print-only CV template carries its own h1, but it
  // is display:none on screen and therefore out of the accessibility tree.
  it("has exactly one h1 in the main content", () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll("main h1")).toHaveLength(1);
  });

  it("never skips a heading level", () => {
    const { container } = render(<App />);
    const levels = Array.from(container.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(
      (h) => Number(h.tagName[1]),
    );

    levels.forEach((level, i) => {
      if (i === 0) return;
      expect(level).toBeLessThanOrEqual(levels[i - 1] + 1);
    });
  });
});

describe("content is rendered from the data module", () => {
  it("renders every job", () => {
    render(<App />);
    experienceData.forEach((job) => {
      expect(screen.getAllByText(job.role).length).toBeGreaterThan(0);
    });
  });

  it("renders every skill category", () => {
    render(<App />);
    skillsData.forEach((category) => {
      expect(screen.getAllByText(category.name).length).toBeGreaterThan(0);
    });
  });

  // Every credential, not just the card headings. This became possible when
  // the list stopped being a newline-delimited string: a dropped entry inside
  // one long string was indistinguishable from an edit to it.
  it("renders every certification and every credential under it", () => {
    render(<App />);

    certificationsData.forEach((cert) => {
      expect(screen.getAllByText(cert.title).length).toBeGreaterThan(0);
      cert.items.forEach((item) => {
        expect(screen.getAllByText(item).length).toBeGreaterThan(0);
      });
    });
  });

  // Pins the wiring from the data module through to the screen. The value
  // itself is covered in portfolioData.test.ts, which moves the clock.
  it("renders the computed years of experience in the hero", () => {
    render(<App />);
    expect(screen.getByText(`${yearsOfExperience}+`)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${yearsOfExperience}\\+ years of experience`)),
    ).toBeInTheDocument();
  });

  it("renders every key project", () => {
    render(<App />);
    keyProjectsData.forEach((project) => {
      expect(screen.getAllByText(project.title).length).toBeGreaterThan(0);
    });
  });
});
