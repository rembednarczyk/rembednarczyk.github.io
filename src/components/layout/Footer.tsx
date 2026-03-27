import { useState } from "react";
import { PrivacyPolicyModal } from "../ui/PrivacyPolicyModal";

export function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="relative z-10 py-12 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center gap-4">
        <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
          <p>Designed and built in deep vastness of the space.</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="font-mono text-xs">
              © {new Date().getFullYear()} Remigiusz Bednarczyk. All rights reserved.
            </p>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <button 
              onClick={() => setIsPrivacyOpen(true)}
              className="font-mono text-xs hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </footer>
  );
}
