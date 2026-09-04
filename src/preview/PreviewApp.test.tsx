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

function sendScroll(id: string, origin = "http://localhost:3001"): void {
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { data: { type: "preview:scrollTo", id }, origin }));
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

  it("warns, but does not render, on content from an origin it does not trust", () => {
    // The dropped-in-silence failure made visible: an editor whose origin was
    // never configured posts content and the page never moves. It is still
    // dropped — the check is the boundary — but it says why now, naming the
    // origin so an owner can set VITE_PREVIEW_EDITOR_ORIGIN to it.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    renderPreview();

    sendContent("Should Not Appear", { origin: "https://editor.onrender.test" });

    expect(screen.queryByText("Should Not Appear")).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("https://editor.onrender.test"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("VITE_PREVIEW_EDITOR_ORIGIN"));

    warn.mockRestore();
  });

  it("does not warn when an allowed origin posts content", () => {
    // The warning is for a real misconfiguration, not for every message; a
    // trusted origin renders and says nothing.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    renderPreview();

    sendContent("Shown", { origin: "http://localhost:3001" });

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
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

  it("scrolls the page to a section an allowed origin asks for", () => {
    renderPreview();

    // A section the real page renders with this id, the same anchor the site's
    // navigation scrolls to. jsdom does not implement scrollIntoView, so a
    // stand-in on the element is what proves the call was made.
    const skills = document.getElementById("skills");
    expect(skills).not.toBeNull();
    const scrollIntoView = vi.fn();
    if (skills !== null) skills.scrollIntoView = scrollIntoView;

    sendScroll("skills");

    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("does not scroll for a section an untrusted origin asks for", () => {
    // The origin check is the same boundary content passes: a page the owner
    // did not open cannot move this one either.
    renderPreview();

    const skills = document.getElementById("skills");
    const scrollIntoView = vi.fn();
    if (skills !== null) skills.scrollIntoView = scrollIntoView;

    sendScroll("skills", "https://evil.example");

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
