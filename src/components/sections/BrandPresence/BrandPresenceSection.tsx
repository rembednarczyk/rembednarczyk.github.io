import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { brandPresenceData } from "../../../data/portfolioData";
import { BrandCard } from "./BrandCard";

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
            <BrandCard key={idx} item={item} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
