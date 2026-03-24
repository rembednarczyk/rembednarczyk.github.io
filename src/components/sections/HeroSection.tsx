import { motion } from "motion/react";
import { Terminal } from "lucide-react";
import { heroData } from "../../data/portfolioData";
import { useScrollToSection } from "../../hooks/useScrollToSection";

export function HeroSection() {
  const scrollToSection = useScrollToSection();

  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center items-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-cyan-400 font-mono mb-4 flex items-center gap-2 print:hidden">
          <Terminal aria-hidden="true" size={18} /> Hello World, my name is
        </p>
        <h1
          itemProp="name"
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white print:hidden"
        >
          {heroData.name}
        </h1>
        <h2
          itemProp="jobTitle"
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-400 print:text-2xl print:text-black print:mb-4"
        >
          {heroData.subtitle}
        </h2>
        <p
          itemProp="description"
          className="max-w-2xl text-lg text-slate-400 mb-10 leading-relaxed"
        >
          {heroData.description}
        </p>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl">
          {heroData.metrics.map((metric, i) => (
            <div
              key={i}
              className="group relative bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-cyan-400/50 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] active:scale-95 active:bg-white/5 active:border-cyan-400/50 active:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-500/5 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"></div>
              <span className="relative text-3xl md:text-4xl font-black text-white group-hover:text-cyan-400 group-active:text-cyan-400 transition-colors mb-2 tracking-tight">
                {metric.value}
              </span>
              <span className="relative text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-semibold leading-tight">
                {metric.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {heroData.tags.map((tech, i) => (
            <span
              key={i}
              className="px-3 py-1 text-sm font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 print:hidden">
          <button
            onClick={() => scrollToSection("experience")}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 active:scale-95 text-slate-900 font-bold rounded-lg transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]"
          >
            Explore Experience
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 active:bg-white/10 active:scale-95 border border-white/10 text-white font-semibold rounded-lg transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            Get in Touch
          </button>
        </div>
      </motion.div>
    </section>
  );
}
