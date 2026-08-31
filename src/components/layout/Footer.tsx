import { useState } from "react";
import { PrivacyPolicyModal } from "../ui/PrivacyPolicyModal";
import { CookieConsent } from "../ui/CookieConsent";
import type { ConsentState } from "../../hooks/useCookieConsent";

export interface FooterProps {
  consent: ConsentState;
  onAccept: () => void;
  onDecline: () => void;
  /** Clears the stored choice, which brings the banner back. */
  onReset: () => void;
}

/**
 * The consent choice is passed in rather than read here. It used to be this
 * component's own state, and the scroll-to-top button — a sibling two levels
 * up — had no way to know the banner was up, so the two of them claimed the
 * same corner: at 768px the button covered a third of Accept and took the
 * taps meant for it.
 */
export function Footer({ consent, onAccept, onDecline, onReset }: FooterProps) {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // The bottom padding keeps the floating scroll-to-top button off the
  // footer's text, which is what it turned out to be for. It was
  // `pb-24 sm:pb-12`, and I assumed it was reserving room for the consent
  // banner — that is now measured by useSpaceForFixedBar, so the assumption
  // said this was free to go. Cutting it to `pb-8` put the button on the
  // copyright line at 390px and on the privacy link at 640px.
  //
  // 64px below 640px and 80px above it, measured across ten widths from 320
  // to 1440: the button clears every piece of footer text at all of them.
  // 640px is the only width that needs the larger value — the row of footer
  // text is widest there relative to the viewport — and one value across the
  // breakpoint beats a third breakpoint for whitespace.
  return (
    <footer className="relative z-10 pt-8 pb-16 sm:pb-20 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center gap-4">
        <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
          <p>Designed and built in deep vastness of the space.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2">
            <p className="font-mono text-xs text-center">
              © {new Date().getFullYear()} Remigiusz Bednarczyk. All rights reserved.
            </p>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">•</span>
            <button 
              onClick={() => setIsPrivacyOpen(true)}
              className="font-mono text-xs hover:text-cyan-400 transition-colors focus-ring rounded-sm px-2 py-3.5 -mx-2"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onChangeConsent={consent === "unset" ? undefined : onReset}
      />
      <CookieConsent
        isVisible={consent === "unset"}
        onAccept={onAccept}
        onDecline={onDecline}
        onOpenPolicy={() => setIsPrivacyOpen(true)}
      />
    </footer>
  );
}
