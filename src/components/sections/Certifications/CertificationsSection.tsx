import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { certificationsData } from "../../../data/portfolioData";
import { CertificationCard } from "./CertificationCard";

export function CertificationsSection() {
  return (
    <section id="certifications" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="07" title="Certifications & Credentials" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificationsData.map((item, idx) => (
            <CertificationCard key={idx} item={item} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
