import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";
import { cvData } from "../data/portfolioFacts";

/**
 * What a visitor gets when the page cannot render. Before this, React
 * unmounted the whole tree and left an empty document: no message, no
 * contact details, nothing to click, and no sign anything had gone wrong.
 */

const Boom = ({ when = true }: { when?: boolean }) => {
  if (when) throw new Error("something in the page threw");
  return <p>the page</p>;
};

/** React prints the caught error itself, which is noise in a passing test. */
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("when nothing is wrong", () => {
  it("renders the page and stays out of the way", () => {
    render(
      <ErrorBoundary>
        <Boom when={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("the page")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /again/i })).not.toBeInTheDocument();
  });
});

describe("when the page fails to render", () => {
  const renderFailing = (onError?: (error: Error) => void) =>
    render(
      <ErrorBoundary {...(onError ? { onError } : {})}>
        <Boom />
      </ErrorBoundary>,
    );

  it("shows something instead of an empty document", () => {
    renderFailing();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      cvData.header.name,
    );
    expect(screen.queryByText("the page")).not.toBeInTheDocument();
  });

  /**
   * The point of the fallback. This site exists so somebody can get in
   * touch, and a broken page should still let them.
   */
  it("still carries every way of getting in touch", () => {
    renderFailing();

    const email = cvData.header.email.href;
    const phone = cvData.header.phone.href;

    expect(screen.getByRole("link", { name: email })).toHaveAttribute(
      "href",
      `mailto:${email}`,
    );
    expect(
      screen.getByRole("link", { name: cvData.header.phone.display.join("") }),
    ).toHaveAttribute("href", `tel:${phone}`);
    expect(
      screen.getByRole("link", { name: cvData.header.linkedin }),
    ).toHaveAttribute("href", `https://${cvData.header.linkedin}`);
  });

  it("reads those details from the same data the page does", () => {
    // A second copy typed into the fallback would be wrong the day the
    // first one changed, and nobody looks at a page that never breaks.
    renderFailing();
    expect(screen.getByText(cvData.header.email.display.join(""))).toBeInTheDocument();
  });

  it("offers a way to try again", async () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload },
      configurable: true,
    });

    renderFailing();
    await userEvent.click(screen.getByRole("button", { name: /again/i }));

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reports the error rather than swallowing it", () => {
    // Otherwise the only trace of a failure is the fallback, which says
    // nothing about the cause.
    const onError = vi.fn();
    renderFailing(onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(consoleError).toHaveBeenCalled();
  });

  it("puts the fallback in a main landmark", () => {
    renderFailing();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

/**
 * A boundary that exists but is not mounted is worth nothing, and nothing
 * else reports it: this file and the story both import the component
 * directly, so it stays reachable, type-checks and passes its own tests
 * while the app renders without it.
 */
describe("the app's own tree", () => {
  const entry = readFileSync(
    resolve(__dirname, "..", "main.tsx"),
    "utf8",
  ).replace(/\s+/g, " ");

  it("mounts the boundary around the whole app", () => {
    // Around App rather than inside it: a boundary further down would miss
    // the routing decision and the motion provider, which are exactly the
    // failures a visitor cannot work around.
    expect(entry).toMatch(/<ErrorBoundary>\s*<App\s*\/>\s*<\/ErrorBoundary>/);
  });
});
