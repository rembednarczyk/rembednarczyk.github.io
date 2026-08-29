import { m } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { achievementsData } from "../../../data/portfolioFacts";
import { AchievementItem } from "./AchievementItem";

export function AchievementsSection() {
  return (
    <section id="achievements" className="py-24">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="04" title="Key Achievements" />

        <ul className="grid gap-4 max-w-4xl mx-auto">
          {achievementsData.map((achievement, idx) => (
            <AchievementItem key={idx} achievement={achievement} />
          ))}
        </ul>
      </m.div>
    </section>
  );
}
