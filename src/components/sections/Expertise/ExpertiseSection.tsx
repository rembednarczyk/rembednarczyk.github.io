import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { expertiseData } from "../../../data/portfolioData";
import { ExpertiseCard } from "./ExpertiseCard";

export function ExpertiseSection() {
  return (
    <section id="expertise" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="01" title="Core Expertise" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expertiseData.map((item, idx) => (
            <ExpertiseCard key={idx} item={item} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
