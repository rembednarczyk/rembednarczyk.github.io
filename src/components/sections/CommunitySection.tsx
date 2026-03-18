import { motion } from "motion/react";
import { SectionHeading } from "../ui/SectionHeading";
import { communityData } from "../../data/portfolioData";

export function CommunitySection() {
  return (
    <section id="community" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="07" title="Community & Leadership" />

        <ul className="grid gap-4 max-w-4xl mx-auto">
          {communityData.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li
                key={idx}
                className="group flex items-start gap-4 bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/5 hover:border-cyan-400/30 active:scale-[0.98] active:bg-white/5 active:border-cyan-400/30 transition-all duration-300"
              >
                <div className="mt-1">
                  <Icon
                    className="text-cyan-400 group-hover:scale-110 group-active:scale-110 transition-transform duration-300"
                    size={24}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-slate-300 text-lg leading-relaxed group-hover:text-white group-active:text-white transition-colors">
                  {item.text}
                </p>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
