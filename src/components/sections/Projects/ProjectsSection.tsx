import { keyProjectsData } from "../../../data/portfolioData";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {keyProjectsData.map((project, idx) => (
        <ProjectCard key={idx} project={project} />
      ))}
    </div>
  );
}
