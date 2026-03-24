import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { experienceData } from "../../../data/portfolioData";
import { ExperienceItem } from "./ExperienceItem";

export function ExperienceSection() {
  return (
    <section id="experience" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="03" title="Professional Experience" />

        <div className="space-y-8">
          {experienceData.map((job, idx) => (
            <ExperienceItem key={idx} job={job} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
