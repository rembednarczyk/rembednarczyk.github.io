import { RefObject, useEffect, useRef } from "react";
import { useScrollLock } from "./useScrollLock";

/** Elements that can receive keyboard focus inside a dialog. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export interface UseModalA11yOptions {
  isOpen: boolean;
  onClose: () => void;
  /** The dialog element. Focus is confined inside it while open. */
  containerRef: RefObject<HTMLElement | null>;
  /** Receives focus when the dialog opens. Falls back to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Dialog keyboard and focus behaviour: Escape to close, a focus trap so Tab
 * cannot reach the page behind, and focus moved in on open then returned to
 * the trigger on close.
 *
 * Holding the page still is not focus behaviour and lives in useScrollLock,
 * which counts its holders so overlapping overlays cannot release each
 * other's lock.
 *
 * `aria-modal="true"` only tells assistive technology that the rest of
 * the page is inert -- it does not stop Tab from walking out of the
 * dialog. That part has to be implemented.
 */
export function useModalA11y({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
}: UseModalA11yOptions) {
  // Callers usually pass an inline arrow, which would otherwise re-run the
  // whole effect -- and re-steal focus -- on every parent render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key !== "Tab") return;

      const elements = focusable();
      if (elements.length === 0) {
        e.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;

      // Wrap around at both ends, and pull focus back in if it has escaped.
      if (e.shiftKey && (active === first || !container?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !container?.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    // Wait a frame so the dialog is laid out before focus moves into it.
    const frame = requestAnimationFrame(() => {
      // That frame is a window in which someone can already have moved focus
      // themselves. Pulling it back would undo their action: it landed
      // mid-word in the wrong field, which left the form invalid and stopped
      // it submitting at all. The dialog claims only focus still outside it.
      if (container?.contains(document.activeElement)) return;

      const target = initialFocusRef?.current ?? focusable()[0];
      target?.focus();
    });

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, containerRef, initialFocusRef]);

  useScrollLock(isOpen);
}
