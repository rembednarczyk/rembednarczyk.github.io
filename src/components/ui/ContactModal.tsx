import { useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";
import { useModalA11y } from "../../hooks/useModalA11y";
import { useContactForm } from "../../hooks/useContactForm";

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Shared by every field, so the three inputs cannot drift apart. */
const FIELD_CLASSES =
  "w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all";

/**
 * The dialog. It renders the form and the outcome and owns nothing else:
 * keyboard and focus behaviour is useModalA11y, the submission state machine
 * is useContactForm, and the request itself is lib/contactForm.
 */
export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: firstInputRef,
  });

  const { status, failure, submit } = useContactForm({ onSent: onClose });

  return createPortal(
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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="relative w-full max-w-lg max-h-full flex flex-col bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <h2 id="contact-modal-title" className="text-2xl font-bold text-white">
                Send a Message
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md p-1"
                aria-label="Close modal"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {status === "success" ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400">Thank you for reaching out. I&apos;ll get back to you soon.</p>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  {/* Honeypot for bot protection */}
                  <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      id="name"
                      name="name"
                      required
                      className={FIELD_CLASSES}
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className={FIELD_CLASSES}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      className={`${FIELD_CLASSES} resize-none`}
                      placeholder="Let’s talk testing"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-400 text-sm" role="alert">
                      {failure === "unreachable"
                        ? "Could not reach the form service. Check your connection and try again."
                        : "The message was not accepted. Please try again later, or reach me on LinkedIn."}
                    </p>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg mt-2"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" aria-hidden="true" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" aria-hidden="true" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
