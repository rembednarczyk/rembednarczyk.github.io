import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { skillsData } from "../../../data/portfolioData";
import { SkillCategoryCard } from "./SkillCategoryCard";

export function SkillsSection() {
  return (
    <section id="skills" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="06" title="Technologies & Skills" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillsData.map((category, idx) => (
            <SkillCategoryCard key={idx} category={category} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
