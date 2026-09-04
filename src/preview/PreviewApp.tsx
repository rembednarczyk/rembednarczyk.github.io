import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Portfolio } from "../App";
import { buildContent, ContentProvider, STATIC_CONTENT, type SiteContent } from "../data/content";
import {
  allowedEditorOrigins,
  type Box,
  isContentMessage,
  looksLikeContent,
  originAllowed,
} from "./protocol";

/**
 * The site's own page, drawn from content handed to it live.
 *
 * This is the whole of the preview seam on the site's side. It renders the
 * real `Portfolio` — the same components, so what it shows is what deploys —
 * inside a content provider it can change. The editor posts edited content
 * over `postMessage`; each message rebuilds the page through the site's own
 * transforms and the page redraws. Back the other way go the section
 * geometries, so the editor can scroll the preview to, and highlight, the
 * field being edited.
 *
 * It opens showing the build's own content, so an editor that has not sent
 * anything yet — or is not there at all — still sees the real page rather than
 * a blank frame. Nothing here can write: it is a mirror, and the only road to
 * the repository stays the editor's token-holding server.
 */
export function PreviewApp() {
  const [content, setContent] = useState<SiteContent>(() => STATIC_CONTENT);
  // Who to answer with geometry: the window and origin of the last editor
  // message that passed the origin check.
  const editor = useRef<{ window: Window; origin: string } | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!originAllowed(event.origin)) {
        // The one failure that looks like nothing: an editor posting content
        // from an origin this build was not told to trust. The message is
        // still dropped — the origin check is the security boundary — but it
        // is no longer dropped in silence, so an owner whose preview never
        // moves can see why in the frame's console.
        if (looksLikeContent(event.data)) {
          // Worded to avoid a bare `from "…"`, which the dependency gate reads
          // as an import specifier — the fragility README's dependency entry
          // records.
          console.warn(
            `[preview] ignored an edit posted by ${event.origin} — it is not an allowed editor ` +
              `origin. Set VITE_PREVIEW_EDITOR_ORIGIN to this exact origin at build time and ` +
              `redeploy. Currently allowed: ${allowedEditorOrigins().join(", ")}`,
          );
        }
        return;
      }
      if (!isContentMessage(event.data)) return;

      if (event.source !== null) {
        editor.current = { window: event.source as Window, origin: event.origin };
      }

      try {
        setContent(buildContent(event.data.content));
      } catch (error) {
        const target = editor.current;
        if (target !== null) {
          target.window.postMessage(
            {
              type: "preview:error",
              message: error instanceof Error ? error.message : String(error),
            },
            target.origin,
          );
        }
      }
    }

    window.addEventListener("message", onMessage);
    // Announce readiness to whoever embedded us. The message carries nothing,
    // so "*" is safe; content and geometry only ever go to a checked origin.
    if (window.parent !== window) {
      window.parent.postMessage({ type: "preview:ready" }, "*");
    }

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  // After the page has drawn the new content, hand the editor the geometry.
  useLayoutEffect(() => {
    postGeometry(editor.current, content);
  }, [content]);

  // And whenever the page moves under a fixed content — a scroll, a resize —
  // so the editor's map stays true. Coalesced to one send per frame.
  useEffect(() => {
    let frame = 0;
    const send = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        postGeometry(editor.current, content);
      });
    };

    window.addEventListener("resize", send);
    window.addEventListener("scroll", send, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", send);
      window.removeEventListener("scroll", send);
    };
  }, [content]);

  return (
    <ContentProvider value={content}>
      <Portfolio />
    </ContentProvider>
  );
}

/** Post the page's section boxes to the editor, if one has spoken to us. */
function postGeometry(
  target: { window: Window; origin: string } | null,
  content: SiteContent,
): void {
  if (target === null) return;

  const boxes: Record<string, Box> = {};

  for (const section of content.pageLayout.sections) {
    const id = (section as { id?: unknown }).id;
    if (typeof id !== "string") continue;

    const element = document.getElementById(id);
    if (element === null) continue;

    const rect = element.getBoundingClientRect();
    boxes[id] = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
  }

  target.window.postMessage({ type: "preview:geometry", boxes }, target.origin);
}
