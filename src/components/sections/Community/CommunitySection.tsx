import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { communityData } from "../../../data/portfolioData";
import { CommunityCard } from "./CommunityCard";

export function CommunitySection() {
  return (
    <section id="community" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="09" title="Community & Leadership" />

        <ul className="grid gap-4 max-w-4xl mx-auto">
          {communityData.map((item, idx) => (
            <CommunityCard key={idx} item={item} />
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
