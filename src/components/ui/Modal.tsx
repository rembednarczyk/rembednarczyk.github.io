import { ReactNode, RefObject, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useModalA11y } from "../../hooks/useModalA11y";

/**
 * The dialog shell: the portal, the backdrop, the panel, the header and the
 * close button.
 *
 * Two dialogs wrote all of it out — the same portal into document.body, the
 * same AnimatePresence, the same backdrop that closes on a click, the same
 * four animation props, the same role, aria-modal and aria-labelledby, and
 * the same eleven-class panel differing in one word: how wide it is. The
 * keyboard and focus behaviour was already shared in useModalA11y; the
 * markup around it was not, so the two dialogs were one edit apart from
 * disagreeing about what a dialog is.
 *
 * The title id is generated here rather than passed in. It was two magic
 * strings that had to match their aria-labelledby by hand, and nothing
 * outside the components referred to them.
 *
 * What stays with the caller is the body, because the bodies are not alike:
 * a form and a policy want different rhythm inside the same frame.
 */

const WIDTHS = {
  /** A form: narrow enough that the fields do not run long. */
  form: "max-w-lg",
  /** Running text, which needs a wider column to stay readable. */
  prose: "max-w-2xl",
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Sits before the title. */
  icon?: ReactNode;
  width?: keyof typeof WIDTHS;
  /** Names the close button, which is the only control this shell owns. */
  closeLabel: string;
  /**
   * Where focus lands when it opens. Left off, it is the close button —
   * the right answer for a dialog the visitor is reading rather than
   * filling in.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Applied to the scrolling body, for the rhythm the caller wants. */
  bodyClassName?: string;
  children: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  width = "form",
  closeLabel,
  initialFocusRef,
  bodyClassName = "",
  children,
}: ModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: initialFocusRef ?? closeButtonRef,
  });

  // The container below carries `print:hidden` because this shell portals
  // into document.body, which puts it outside the wrapper in App.tsx that
  // hides the screen page from the printer. Every other overlay declares the
  // rule on itself — the consent banner and the scroll-to-top button both do
  // — and this is the one that escapes the wrapper, so it needed it most and
  // was the only one without it. Printed while open, it landed on all six
  // sheets of the CV: a fixed element repeats on every page, and its
  // backdrop left 96% of each sheet dark.
  //
  // On the container and not on the panel, which is not a detail: the
  // backdrop is a sibling inside it, so hiding only the panel takes the
  // dialog's words off paper and leaves its backdrop on — 61% of every
  // sheet, measured. Nothing about that is visible in extracted text, and
  // for one merge nothing looked at anything else. `check:print` rasterises
  // both prints now and compares the ink.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 print:hidden">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative w-full ${WIDTHS[width]} max-h-full flex flex-col bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left`}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                {icon}
                <h2 id={titleId} className="text-2xl font-bold text-white">
                  {title}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                // p-2.5 rather than p-1: the icon stays 24px and the tap
                // area reaches 44x44 (SC 2.5.5). It was 32x32 — the way out
                // of a dialog for anyone using a pointer, and the smallest
                // control in it.
                className="text-slate-400 hover:text-white transition-colors focus-ring rounded-md p-2.5 -m-1"
                aria-label={closeLabel}
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            <div
              className={`p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${bodyClassName}`}
            >
              {children}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
