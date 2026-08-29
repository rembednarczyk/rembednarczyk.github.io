import { useEffect } from "react";
import { isPrintRequest, withoutPrintRequest } from "../lib/printRequest";

/**
 * Longest the visitor waits before the dialog opens regardless.
 *
 * The page currently loads no web fonts and the print template holds no
 * bitmap images, so readiness resolves immediately and this cap is never
 * reached. It is here for the day one of those changes and fails to load:
 * a print dialog that never opens is worse than one that opens early.
 */
const READY_TIMEOUT = 3000;

/** Resolves once the things a printed page depends on have settled. */
function documentReady(): Promise<unknown> {
  // jsdom implements no font loading API, and neither did older browsers.
  const fonts: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();

  if (document.readyState === "complete") return fonts;

  return Promise.all([
    fonts,
    new Promise((resolve) =>
      window.addEventListener("load", resolve, { once: true }),
    ),
  ]);
}

export interface UseAutoPrintOptions {
  /** Resolves when the page is ready to be printed. */
  ready?: () => Promise<unknown>;
  /** Longest wait before printing anyway. */
  timeout?: number;
}

/**
 * Opens the print dialog when the page was opened by the printed QR code.
 *
 * It used to wait a flat 1500ms, with a comment saying that was to let
 * fonts and styles load. Nothing here loads a font: the page uses the
 * system stack, and the print template draws its icons and its QR as
 * inline SVG. The delay was guarding against nothing and the visitor paid
 * for it every time, so the wait is now on the actual signals, which
 * resolve at once.
 */
export function useAutoPrint({
  ready = documentReady,
  timeout = READY_TIMEOUT,
}: UseAutoPrintOptions = {}) {
  useEffect(() => {
    if (!isPrintRequest(window.location.search)) return;

    let done = false;

    const print = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);

      // Dropped before the dialog opens, since window.print blocks until it
      // is dismissed and the address should already be clean by then.
      window.history.replaceState(
        null,
        "",
        withoutPrintRequest(window.location.href),
      );

      window.print();
    };

    const timer = setTimeout(print, timeout);
    void Promise.resolve(ready()).then(print);

    return () => {
      // Without this the dialog opens against a page that is gone.
      done = true;
      clearTimeout(timer);
    };
  }, [ready, timeout]);
}
