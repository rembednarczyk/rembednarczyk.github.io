import { useContent } from "../../../data/content";
import { ExperienceItem } from "./ExperienceItem";

/**
 * The `experience` band, one of the page's numbered run.
 *
 * Its heading, its number and its anchor are not here: they are in
 * src/content/pageLayout.json, and src/App.tsx wraps this in `PageSection`
 * with them. What is here is the arrangement and nothing else.
 *
 * src/components/PageBodies.tsx is what maps the name to this component.
 */
export function ExperienceSection() {
  const { experienceData } = useContent();
  return (
    <div className="space-y-8">
      {experienceData.map((job, idx) => (
        <ExperienceItem key={idx} job={job} />
      ))}
    </div>
  );
}
