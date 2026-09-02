import { skillsData } from "../../../data/portfolioData";
import { SkillCategoryCard } from "./SkillCategoryCard";

/**
 * The `skills` band, one of the page's numbered run.
 *
 * Its heading, its number and its anchor are not here: they are in
 * src/content/pageLayout.json, and src/App.tsx wraps this in `PageSection`
 * with them. What is here is the arrangement and nothing else.
 *
 * src/components/PageBodies.tsx is what maps the name to this component.
 */
export function SkillsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {skillsData.map((category, idx) => (
        <SkillCategoryCard key={idx} category={category} />
      ))}
    </div>
  );
}
