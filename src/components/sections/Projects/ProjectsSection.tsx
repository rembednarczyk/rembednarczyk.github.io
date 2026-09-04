import { useContent } from "../../../data/content";
import { ProjectCard } from "./ProjectCard";

/**
 * The `projects` band, one of the page's numbered run.
 *
 * Its heading, its number and its anchor are not here: they are in
 * src/content/pageLayout.json, and src/App.tsx wraps this in `PageSection`
 * with them. What is here is the arrangement and nothing else.
 *
 * src/components/PageBodies.tsx is what maps the name to this component.
 */
export function ProjectsSection() {
  const { keyProjectsData } = useContent();
  // A featured programme leads the band, full-width; the rest keep their order.
  const ordered = [...keyProjectsData].sort(
    (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
  );
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {ordered.map((project, idx) => (
        <ProjectCard key={idx} project={project} />
      ))}
    </div>
  );
}
