import { motion } from "motion/react";
import { SectionHeading } from "../ui/SectionHeading";
import { skillsData } from "../../data/portfolioData";

export function SkillsSection() {
  return (
    <section id="skills" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="03" title="Technologies & Skills" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {skillsData.map((category, idx) => (
            <article
              key={idx}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 active:scale-95 active:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div aria-hidden="true">{category.icon}</div>
                <h4 className="font-semibold text-white">{category.name}</h4>
              </div>
              <ul className="space-y-2">
                {category.skills.map((skill, sIdx) => (
                  <li
                    key={sIdx}
                    className="text-slate-400 text-sm flex items-center gap-2"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"
                      aria-hidden="true"
                    ></span>
                    {skill}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
