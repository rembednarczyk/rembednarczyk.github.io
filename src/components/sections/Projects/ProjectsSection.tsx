import { motion } from "motion/react";
import { SectionHeading } from "../../ui/SectionHeading";
import { keyProjectsData } from "../../../data/portfolioData";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="08" title="Selected Initiatives" />

        <div className="grid md:grid-cols-2 gap-8">
          {keyProjectsData.map((project, idx) => (
            <ProjectCard key={idx} project={project} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
