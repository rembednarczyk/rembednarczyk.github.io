import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { recognitionData } from "../../../data/portfolioData";
import { AwardCard } from "./AwardCard";

export function RecognitionSection() {
  return (
    <section id="recognition" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="05" title="Awards & Recognition" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recognitionData.map((award, idx) => (
            <AwardCard key={idx} award={award} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
