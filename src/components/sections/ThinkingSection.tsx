import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { thinkingQuote } from "../../data/portfolioData";

export function ThinkingSection() {
  return (
    <section className="py-24 print:hidden relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-3xl mx-auto flex flex-col items-center text-center px-6"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
          <Quote 
            className="relative text-cyan-400/60 w-16 h-16 md:w-20 md:h-20" 
            aria-hidden="true" 
          />
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-cyan-300 to-slate-300 leading-tight md:leading-tight tracking-tight italic">
          &quot;{thinkingQuote}&quot;
        </h2>
        <div className="mt-10 w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-full" />
      </motion.div>
    </section>
  );
}
