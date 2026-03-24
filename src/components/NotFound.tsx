import { motion, useReducedMotion } from "framer-motion";
import { Terminal } from "lucide-react";
import { ParticleBackground } from "./ParticleBackground";
import { useEffect, useState } from "react";

const lines = [
  { text: "Resource not found", delay: 500 },
  { text: "Navigation context: invalid", delay: 1500 },
  { text: "Recovery action required", delay: 3000 },
  { text: "Redirect to a stable system state.", delay: 4500, isRecommendation: true },
];

const TerminalWindow = () => {
  const shouldReduceMotion = useReducedMotion();

  const [visibleLines, setVisibleLines] = useState<number>(shouldReduceMotion ? lines.length : 0);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (visibleLines >= lines.length) return;

    const currentLine = lines[visibleLines];
    let i = 0;
    let typingInterval: NodeJS.Timeout;

    const startTyping = () => {
      typingInterval = setInterval(() => {
        setCurrentText(currentLine.text.substring(0, i + 1));
        i++;
        if (i >= currentLine.text.length) {
          clearInterval(typingInterval);
          setTimeout(() => {
            setVisibleLines((v) => v + 1);
            setCurrentText("");
          }, 500); // Pause before next line
        }
      }, 40); // Typing speed
    };

    const initialDelay = setTimeout(startTyping, visibleLines === 0 ? currentLine.delay : 200);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(typingInterval);
    };
  }, [visibleLines, shouldReduceMotion]);

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 sm:p-8 mb-8 shadow-2xl w-full max-w-2xl font-mono text-sm sm:text-base">
      {/* Screen reader only text for the terminal content */}
      <div className="sr-only" aria-live="polite">
        System status: Resource not found. Navigation context: invalid. Recovery action required. Recommendation: Redirect to a stable system state.
      </div>

      {/* Visual terminal hidden from screen readers to prevent character-by-character reading */}
      <div aria-hidden="true">
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>

        <div className="space-y-4">
          {lines.slice(0, visibleLines).map((line, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${line.isRecommendation ? "mt-8 pt-6 border-t border-white/10 text-purple-400" : "text-cyan-400"}`}>
              {line.isRecommendation ? (
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold font-sans">Recommendation:</span>
                  <div className="flex items-start gap-3">
                    <Terminal size={18} className="mt-0.5 shrink-0 opacity-70" />
                    <span>{line.text}</span>
                  </div>
                </div>
              ) : (
                <>
                  <Terminal size={18} className="mt-0.5 shrink-0 opacity-70" />
                  <span>{line.text}</span>
                </>
              )}
            </div>
          ))}

          {/* Currently typing line */}
          {!shouldReduceMotion && visibleLines < lines.length && (
            <div className={`flex items-start gap-3 ${lines[visibleLines].isRecommendation ? "mt-8 pt-6 border-t border-white/10 text-purple-400" : "text-cyan-400"}`}>
              {lines[visibleLines].isRecommendation ? (
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold font-sans">Recommendation:</span>
                  <div className="flex items-start gap-3">
                    <Terminal size={18} className="mt-0.5 shrink-0 opacity-70" />
                    <span>
                      {currentText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-4 bg-current ml-1 align-middle"
                      />
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <Terminal size={18} className="mt-0.5 shrink-0 opacity-70" />
                  <span>
                    {currentText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-2 h-4 bg-current ml-1 align-middle"
                    />
                  </span>
                </>
              )}
            </div>
          )}

          {/* Blinking cursor after all lines finish */}
          {visibleLines >= lines.length && (
            <div className="flex items-start gap-3 text-cyan-400 opacity-50">
              <Terminal size={18} className="mt-0.5 shrink-0 opacity-0" />
              <motion.span
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-current align-middle"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden flex items-center justify-center">
      <ParticleBackground />

      <main className="relative z-10 w-full px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl flex flex-col items-center sm:items-start"
        >
          <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tighter mb-2 text-center sm:text-left">
            404 <span className="text-cyan-500">-</span> Signal Lost
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl mb-12 text-center sm:text-left">
            Error handled gracefully.
          </p>

          <TerminalWindow />

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 6.5, duration: 0.8 }}
            className="w-full flex justify-center sm:justify-start mt-4"
          >
            <a
              href="/"
              aria-label="Return to homepage"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/20 hover:border-cyan-400/40 rounded-xl text-white font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] backdrop-blur-sm"
            >
              <span aria-hidden="true" className="text-cyan-400 group-hover:-translate-x-1 transition-transform">
                &larr;
              </span>
              Go to Homepage
            </a>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
