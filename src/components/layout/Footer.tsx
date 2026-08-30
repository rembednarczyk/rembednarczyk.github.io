import { useState } from "react";
import { PrivacyPolicyModal } from "../ui/PrivacyPolicyModal";
import { CookieConsent } from "../ui/CookieConsent";
import { useCookieConsent } from "../../hooks/useCookieConsent";

export function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const { consent, accept, decline, reset } = useCookieConsent();

  return (
    <footer className="relative z-10 pt-8 pb-24 sm:pb-12 border-t border-white/10">
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
              className="font-mono text-xs hover:text-cyan-400 transition-colors focus-ring rounded-sm"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onChangeConsent={consent === "unset" ? undefined : reset}
      />
      <CookieConsent
        isVisible={consent === "unset"}
        onAccept={accept}
        onDecline={decline}
        onOpenPolicy={() => setIsPrivacyOpen(true)}
      />
    </footer>
  );
}
