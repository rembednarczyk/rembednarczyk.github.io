import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Shield } from "lucide-react";
import { cvData } from "../../data/portfolioData";

export interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      // Focus the close button when modal opens for accessibility
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
    
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
            className="relative w-full max-w-2xl max-h-full flex flex-col bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                <h2 id="privacy-modal-title" className="text-2xl font-bold text-white">
                  Privacy Policy
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md p-1"
                aria-label="Close privacy policy"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto text-slate-300 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <p className="text-sm text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">1. Data Controller</h3>
                <p>
                  The data controller responsible for processing your personal data is:
                </p>
                <div className="pl-4 border-l-2 border-slate-700">
                  <p className="font-medium text-slate-200">{cvData.header.name}</p>
                  <p>
                    NIP:{" "}
                    <span className="inline-flex">
                      {["946", "251", "62", "63"].map((part, i) => (
                        <span key={i}>{part}</span>
                      ))}
                    </span>
                  </p>
                  <p>
                    Email:{" "}
                    <span className="inline-flex">
                      {cvData.header.email.display.map((part, i) => (
                        <span key={i}>{part}</span>
                      ))}
                    </span>
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">2. Introduction</h3>
                <p>
                  Welcome to my personal portfolio website. I respect your privacy and am committed to protecting any personal data you may share while visiting this site. This Privacy Policy explains what information is collected, how it is used, and your rights regarding it.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">3. Information Collection and Use</h3>
                <p>
                  This website is a static portfolio and does not directly collect personal data, create user accounts, or track individual users for marketing purposes. However, some data may be processed through third-party services:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-slate-200">Contact Form (Web3Forms):</strong> If you use the contact form, the information you provide (Name, Email, Message) is securely processed by a third-party email service, <strong>Web3Forms</strong>, solely for the purpose of delivering your inquiry to my inbox. Web3Forms does not store your data for their own marketing purposes. I do not store this data in any database or share it with other third parties. Please refer to the <a href="https://web3forms.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Web3Forms Privacy Policy</a> for more details.
                  </li>
                  <li>
                    <strong className="text-slate-200">Hosting (GitHub Pages):</strong> This website is hosted on GitHub Pages. GitHub may collect standard server logs, including IP addresses of visitors, to maintain the security and performance of their service. Please refer to the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">GitHub Privacy Statement</a> for more details. <strong className="text-slate-200">International Transfers:</strong> Since the website is hosted on GitHub Pages, your data (such as IP address) may be transferred to and processed in the United States. This transfer is based on Standard Contractual Clauses (SCCs) to ensure an adequate level of data protection as required by the GDPR.
                  </li>
                </ul>
                <p>
                  The legal basis for processing is legitimate interest (Article 6(1)(f) GDPR), which is communication related to professional inquiries.
                </p>
                <p>
                  <strong className="text-slate-200">Data Retention:</strong> Personal data provided via the contact form will be stored only for the duration necessary to address your inquiry or until you request its deletion, unless further storage is required by law.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">4. Cookies and Analytics</h3>
                <p>
                  This website does not use any intrusive tracking cookies. If any analytics tools (like Google Analytics or Google Tag Manager) are implemented to monitor basic website traffic and performance, they are configured to anonymize IP addresses and do not collect personally identifiable information (PII).
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">5. Your Rights</h3>
                <p>
                  Under the General Data Protection Regulation (GDPR) and other applicable privacy laws, you have the right to request access to, correction of, or deletion of any personal data you have sent me via the contact form. To exercise these rights, please contact me directly.
                </p>
                <p>
                  <strong className="text-slate-200">Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory authority if you believe that the processing of your personal data violates the GDPR. In Poland, the competent authority is the President of the Personal Data Protection Office (Prezes Urzędu Ochrony Danych Osobowych), ul. Stawki 2, 00-193 Warsaw.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">6. Contact</h3>
                <p>
                  If you have any questions about this Privacy Policy, please feel free to reach out via the contact form on this website.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
