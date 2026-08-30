import { render, screen, waitFor } from "@testing-library/react";
import { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { MotionProvider } from "./MotionProvider";
import { NOT_FOUND_TITLE, NotFound } from "./NotFound";

/**
 * The whole 404 branch had no test of any kind. It is 179 lines chosen by
 * pathname, and the build copies index.html to 404.html, so this is the
 * real error page: the only person who would find it broken is a visitor
 * who followed a dead link, and they have no way to report it.
 */

// The canvas background needs APIs jsdom does not provide, and it renders
// nothing meaningful to assert on.
vi.mock("./ParticleBackground", () => ({
  ParticleBackground: () => null,
}));

/**
 * NotFound uses `m`, which renders nothing without the feature set App
 * loads. The app's own wrapper rather than a copy of it: a copy is how the
 * reduced-motion answer came to be missing from two of the three places
 * that set motion up.
 */
const withMotion = (ui: ReactElement) => <MotionProvider>{ui}</MotionProvider>;

function visit(path: string) {
  window.history.replaceState(null, "", path);
}

const originalTitle = document.title;

beforeEach(() => {
  visit("/");
  document.title = originalTitle;

  // jsdom does not implement it, and the page scrolls to a section when the
  // address names one. Supplied rather than guarded against in the hook:
  // every browser has this, so a check there would exist for jsdom alone.
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("which page a path resolves to", () => {
  it.each(["/", "/index.html"])("serves the portfolio at %s", (path) => {
    visit(path);
    render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.queryByText(/Signal Lost/)).not.toBeInTheDocument();
  });

  it.each([
    ["a path that was never a page", "/about"],
    ["a deep path", "/blog/2024/post"],
    ["a trailing slash", "/projects/"],
    ["a path that looks like a file", "/resume.pdf"],
  ])("serves the 404 page for %s", (_case, path) => {
    visit(path);
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Signal Lost/);
  });

  it("keeps serving the portfolio when a hash selects a section", () => {
    // The navigation uses hashes, so a hash must never be read as a path.
    visit("/#contact");
    render(<App />);

    expect(screen.queryByText(/Signal Lost/)).not.toBeInTheDocument();
  });

  it("keeps serving the portfolio when the print request is present", () => {
    visit("/?print=true");
    render(<App />);

    expect(screen.queryByText(/Signal Lost/)).not.toBeInTheDocument();
  });
});

describe("the 404 page", () => {
  it("says so in the tab, the history entry and the bookmark", async () => {
    render(withMotion(<NotFound />));

    await waitFor(() => expect(document.title).toBe(NOT_FOUND_TITLE));
    expect(document.title).toMatch(/404/);
    expect(document.title).not.toBe(originalTitle);
  });

  it("offers a way back to a page that exists", () => {
    render(withMotion(<NotFound />));

    const home = screen.getByRole("link", { name: /homepage/i });
    expect(home).toHaveAttribute("href", "/");
  });

  it("has exactly one h1, and it names the error", () => {
    const { container } = render(withMotion(<NotFound />));

    const headings = container.querySelectorAll("h1");
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toMatch(/404/);
  });

  it("puts its content in a main landmark", () => {
    render(withMotion(<NotFound />));
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  /**
   * The terminal types itself out one character at a time and is hidden
   * from assistive technology for that reason, with a written summary
   * standing in for it. Two texts saying the same thing drift, and the one
   * nobody looks at drifts first.
   */
  it("tells a screen reader everything the terminal shows", () => {
    const { container } = render(withMotion(<NotFound />));

    const summary = container.querySelector("[aria-live]");
    expect(summary).not.toBeNull();

    const terminal = container.querySelector("[aria-hidden='true']");
    expect(terminal).not.toBeNull();

    for (const line of [
      "Resource not found",
      "Navigation context: invalid",
      "Recovery action required",
      "Redirect to a stable system state.",
    ]) {
      expect(summary!.textContent).toContain(line);
    }
  });
});
