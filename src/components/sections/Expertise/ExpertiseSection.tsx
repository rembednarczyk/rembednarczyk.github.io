import { useContent } from "../../../data/content";
import { entryEdit } from "../../../preview/edit";
import { ExpertiseCard } from "./ExpertiseCard";

/**
 * The `expertise` band, one of the page's numbered run.
 *
 * Its heading, its number and its anchor are not here: they are in
 * src/content/pageLayout.json, and src/App.tsx wraps this in `PageSection`
 * with them. What is here is the arrangement and nothing else.
 *
 * src/components/PageBodies.tsx is what maps the name to this component.
 */
export function ExpertiseSection() {
  const { expertiseData } = useContent();
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expertiseData.map((item, idx) => (
        <ExpertiseCard key={idx} item={item} edit={entryEdit("expertise", "areas", idx)} />
      ))}
    </div>
  );
}
