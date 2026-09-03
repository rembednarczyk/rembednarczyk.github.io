import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentProvider, STATIC_CONTENT, useContent, type SiteContent } from "./content";
import { heroData } from "./portfolioFacts";

/**
 * The seam that makes a live preview possible, tested at both of its ends.
 *
 * A section now reads its content from a context instead of importing it. The
 * two things that has to be true: with no provider — every page, story and
 * test that exists today — the context hands back the build's own content, so
 * nothing rendered changes; and a provider can hand back something else, which
 * is the one override the preview relies on. Break either and this goes red.
 */

function Probe() {
  const { heroData: hero } = useContent();
  return <span>{hero.name}</span>;
}

describe("the content seam", () => {
  it("defaults to the build's own content, so a page with no provider is unchanged", () => {
    // The default context value is the very object the sections used to
    // import — same identity, not merely an equal copy.
    expect(STATIC_CONTENT.heroData).toBe(heroData);

    render(<Probe />);

    expect(screen.getByText(heroData.name)).toBeInTheDocument();
  });

  it("lets a provider override what a component reads — the whole point", () => {
    const doctored: SiteContent = {
      ...STATIC_CONTENT,
      heroData: { ...heroData, name: "Someone Else Entirely" },
    };

    render(
      <ContentProvider value={doctored}>
        <Probe />
      </ContentProvider>,
    );

    expect(screen.getByText("Someone Else Entirely")).toBeInTheDocument();
    expect(screen.queryByText(heroData.name)).not.toBeInTheDocument();
  });
});
