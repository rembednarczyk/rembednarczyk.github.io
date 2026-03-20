import { motion } from "motion/react";
import { SectionHeading } from "../ui/SectionHeading";
import { brandPresenceData } from "../../data/portfolioData";

export function BrandPresenceSection() {
  return (
    <section id="brand" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="10" title="Community & Brand Presence" />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brandPresenceData.map((item, idx) => (
            <article
              key={idx}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:-translate-y-1 hover:bg-white/10 active:scale-[0.98] active:bg-white/10 transition-all duration-300"
            >
              <div className="mb-4" aria-hidden="true">
                {item.icon}
              </div>
              <h4 className="text-white font-bold mb-2">{item.title}</h4>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
