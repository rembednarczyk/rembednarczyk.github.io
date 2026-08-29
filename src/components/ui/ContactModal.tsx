import { useState, useEffect, useRef, FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";
import { useModalA11y } from "../../hooks/useModalA11y";

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Why the failure is split in two: a request the service rejected and a
 * request that never arrived are different statements, and telling someone
 * "something went wrong" when their connection dropped sends them looking
 * in the wrong place. Only the second is worth retrying immediately.
 */
type FailureReason = "rejected" | "unreachable";

/** Shared by every field, so the three inputs cannot drift apart. */
const FIELD_CLASSES =
  "w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all";

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [failure, setFailure] = useState<FailureReason | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useModalA11y({
    isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: firstInputRef,
  });

  /** Tracked so pending status transitions cannot fire after unmount. */
  const schedule = (fn: () => void, delay: number) => {
    timeoutsRef.current.push(setTimeout(fn, delay));
  };

  useEffect(() => {
    const timeouts = timeoutsRef;
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Add Web3Forms required fields
    const payload = {
      ...data,
      access_key: "e08b2649-ead0-4885-91a3-5c8809b38c29",
      subject: `New message from ${data.name} (Portfolio)`,
      from_name: "Portfolio Contact Form",
    };

    // Set together in one place so the reason can never disagree with the
    // status it explains.
    const fail = (reason: FailureReason) => {
      setFailure(reason);
      setStatus("error");
      schedule(() => setStatus("idle"), 3000);
    };

    let response: Response;

    try {
      response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // fetch only rejects when the request never completed.
      fail("unreachable");
      return;
    }

    // An early exit so an error response is not parsed for a result it does
    // not carry. The outcome matches what the checks below would reach
    // anyway, so no test distinguishes this branch; it is here for clarity,
    // not as a guard.
    if (!response.ok) {
      fail("rejected");
      return;
    }

    let result: { success?: boolean };

    try {
      result = await response.json();
    } catch {
      fail("rejected");
      return;
    }

    if (!result.success) {
      fail("rejected");
      return;
    }

    setFailure(null);
    setStatus("success");
    schedule(() => {
      onClose();
      // Reset state after exit animation completes
      schedule(() => setStatus("idle"), 300);
    }, 3000);
  };

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
                <form onSubmit={handleSubmit} className="space-y-4">
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
