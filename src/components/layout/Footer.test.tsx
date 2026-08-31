import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";

/** The footer takes the consent choice and three handlers; none of them
 * touches the year, so they are supplied and ignored. */
const props = {
  consent: "unset" as const,
  onAccept: () => {},
  onDecline: () => {},
  onReset: () => {},
};

/**
 * The copyright year is read off the clock, and one thing checked that.
 *
 * It was the 33 kB page-text snapshot, which recorded `© 2026` and proved
 * it moved by rendering the page five years apart. That snapshot has been
 * replaced by a property — it froze the page's words, and the whole point
 * of moving content into src/content was to let an owner change them — and
 * the year would have gone unheld with it. Nothing else renders the footer
 * in a test, so hardcoding `© 2026` here would have turned nothing red
 * until the following January, on a day with no change to the code.
 *
 * Asserted the way the hero's years figure is: by moving the clock, since
 * asserting today's number passes against a literal just as happily.
 */

afterEach(() => {
  vi.useRealTimers();
});

function footerOn(date: string): string {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(date));

  const { container, unmount } = render(<Footer {...props} />);
  const text = container.textContent ?? "";
  unmount();

  return text;
}

describe("the footer's copyright year", () => {
  it("follows the clock rather than a number someone typed", () => {
    expect(footerOn("2027-03-01")).toContain("© 2027");
    expect(footerOn("2031-12-31")).toContain("© 2031");
  });

  it("renders the footer it is checking, so the above is not vacuous", () => {
    render(<Footer {...props} />);

    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
