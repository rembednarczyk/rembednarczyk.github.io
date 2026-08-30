import { keyProjectsData } from "../../../data/portfolioData";
import { ProjectCard } from "./ProjectCard";
import { PageSection } from "../../ui/PageSection";

export function ProjectsSection() {
  return (
    <PageSection id="projects" number="08" title="Selected Initiatives">
      <div className="grid md:grid-cols-2 gap-8">
        {keyProjectsData.map((project, idx) => (
          <ProjectCard key={idx} project={project} />
        ))}
      </div>
    </PageSection>
  );
}
