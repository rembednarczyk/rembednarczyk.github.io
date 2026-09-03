import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../components/MotionProvider";
import { PreviewApp } from "./PreviewApp";
import { STATIC_RAW } from "../data/content";
import { heroData } from "../data/portfolioFacts";

// The canvas background needs APIs jsdom does not provide and renders nothing
// worth asserting on — mocked exactly as App.test.tsx does.
vi.mock("../components/ParticleBackground", () => ({
  ParticleBackground: () => null,
}));

const renderPreview = () => render(<MotionProvider><PreviewApp /></MotionProvider>);

function sendContent(
  name: string,
  options: { origin?: string; source?: Window } = {},
): void {
  const { origin = "http://localhost:3001", source } = options;
  const content = { ...STATIC_RAW, hero: { ...STATIC_RAW.hero, name } };

  const init: MessageEventInit = { data: { type: "preview:content", content }, origin };
  if (source !== undefined) init.source = source;

  act(() => {
    window.dispatchEvent(new MessageEvent("message", init));
  });
}

describe("the preview harness", () => {
  it("opens on the build's own content, before any editor speaks", () => {
    renderPreview();
    // The real name, so an unattached preview shows the real page.
    expect(screen.getAllByText(heroData.name).length).toBeGreaterThan(0);
  });

  it("redraws the page from content an allowed origin posts", () => {
    renderPreview();

    sendContent("Live Edited Hero");

    expect(screen.getByText("Live Edited Hero")).toBeInTheDocument();
  });

  it("ignores a message from any other origin", () => {
    renderPreview();

    sendContent("Should Not Appear", { origin: "https://evil.example" });

    expect(screen.queryByText("Should Not Appear")).not.toBeInTheDocument();
    expect(screen.getAllByText(heroData.name).length).toBeGreaterThan(0);
  });

  it("answers the editor with the page's section geometry", () => {
    const postMessage = vi.fn();
    const source = { postMessage } as unknown as Window;

    renderPreview();
    sendContent("Geo", { source });

    const geometry = postMessage.mock.calls.find(
      (call) => (call[0] as { type?: string }).type === "preview:geometry",
    );

    expect(geometry).toBeDefined();
    expect(Object.keys((geometry?.[0] as { boxes: object }).boxes).length).toBeGreaterThan(0);
  });
});
