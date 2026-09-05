import { useContent } from "../../../data/content";
import { entryEdit } from "../../../preview/edit";
import { ProjectCard } from "./ProjectCard";
import { leadWithFeatured } from "./order";

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
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {leadWithFeatured(keyProjectsData).map(({ project, index }) => (
        <ProjectCard key={index} project={project} edit={entryEdit("keyProjects", "projects", index)} />
      ))}
    </div>
  );
}
