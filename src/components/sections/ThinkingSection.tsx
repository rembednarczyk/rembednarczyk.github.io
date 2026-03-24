import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { thinkingData } from "../../data/portfolioData";

export function ThinkingSection() {
  return (
    <section className="py-12 print:hidden">
      <div className="grid md:grid-cols-3 gap-6">
        {thinkingData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 active:bg-white/10 hover:-translate-y-1 active:scale-95 transition-all duration-300 group flex flex-col items-center text-center"
          >
            <Quote className="text-cyan-400/30 w-10 h-10 mb-4 group-hover:text-cyan-400/60 group-active:text-cyan-400/60 transition-colors" aria-hidden="true" />
            <p className="text-lg font-medium text-slate-300 leading-relaxed italic">
              "{item.quote}"
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
