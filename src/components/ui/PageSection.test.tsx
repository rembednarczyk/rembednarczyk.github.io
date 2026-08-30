import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageSection } from "./PageSection";

describe("PageSection", () => {
  it("is the anchor the navigation scrolls to", () => {
    const { container } = render(
      <PageSection id="skills" number="06" title="Technologies & Skills">
        <p>content</p>
      </PageSection>,
    );

    const section = container.querySelector("section");
    expect(section?.id).toBe("skills");
  });

  it("heads the section with its number and title", () => {
    render(
      <PageSection id="skills" number="06" title="Technologies & Skills">
        <p>content</p>
      </PageSection>,
    );

    const heading = screen.getByRole("heading", { name: /Technologies & Skills/ });
    expect(heading.textContent).toContain("06");
  });

  it("renders the caller's content below the heading", () => {
    render(
      <PageSection id="skills" number="06" title="Technologies & Skills">
        <p>the four skill columns</p>
      </PageSection>,
    );

    const heading = screen.getByRole("heading", { name: /Technologies & Skills/ });
    const content = screen.getByText("the four skill columns");
    expect(
      heading.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
