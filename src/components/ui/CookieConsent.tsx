import { useRef } from "react";
import { m, AnimatePresence } from "motion/react";
import { Cookie } from "lucide-react";
import { Button } from "./Button";
import { useSpaceForFixedBar } from "../../hooks/useSpaceForFixedBar";

export interface CookieConsentProps {
  /** Whether the banner is shown. Hidden once a choice has been made. */
  isVisible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  /** Opens the full privacy policy. */
  onOpenPolicy: () => void;
}

/**
 * Analytics opt-in banner. Analytics storage stays denied until the
 * visitor accepts, so declining is a no-op that simply records the choice.
 */
export function CookieConsent({
  isVisible,
  onAccept,
  onDecline,
  onOpenPolicy,
}: CookieConsentProps) {
  const bandRef = useRef<HTMLDivElement>(null);

  // The banner covers the foot of the viewport, so the page has to be told
  // that space is spoken for — otherwise a focused control lands behind it.
  useSpaceForFixedBar(bandRef, isVisible);

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          ref={bandRef}
          // Transform only, never opacity: a partially faded banner spends
          // its entrance below the contrast threshold, which is both an
          // accessibility problem and a source of flaky a11y assertions.
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          role="region"
          aria-label="Cookie consent"
          // pointer-events-none on the band, auto on the card. The band runs
          // the full width of the viewport and the card does not, so the
          // transparent strip either side of it was swallowing clicks: two
          // project links sat under it, visually untouched and unclickable.
          className="fixed bottom-0 left-0 right-0 z-[90] p-4 sm:p-6 print:hidden pointer-events-none"
        >
          <div
            className="pointer-events-auto max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:pr-6"
          >
            <Cookie
              className="w-6 h-6 text-cyan-400 shrink-0 hidden sm:block"
              aria-hidden="true"
            />
            <p className="text-sm text-slate-300 leading-relaxed flex-1">
              I use Google Analytics to see which parts of this portfolio get
              read. Nothing is stored until you agree, and the site works the
              same either way.{" "}
              <button
                type="button"
                onClick={onOpenPolicy}
                className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 transition-colors focus-ring rounded-sm"
              >
                Read the privacy policy
              </button>
            </p>
            <div className="flex gap-3 shrink-0">
              <Button variant="outline" size="sm" onClick={onDecline}>
                Decline
              </Button>
              <Button variant="primary" size="sm" onClick={onAccept}>
                Accept
              </Button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
