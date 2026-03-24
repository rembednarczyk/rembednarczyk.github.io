import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { aboutData } from "../../../data/portfolioData";
import { AboutImage } from "./AboutImage";

export function AboutSection() {
  return (
    <section id="about" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="02" title="About me" />

        <div className="grid md:grid-cols-2 gap-12 items-center print:grid-cols-1 print:gap-4">
          <div className="space-y-4 text-slate-400 leading-relaxed">
            {aboutData.paragraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <AboutImage imageUrl={aboutData.imageUrl} />
        </div>
      </motion.div>
    </section>
  );
}
