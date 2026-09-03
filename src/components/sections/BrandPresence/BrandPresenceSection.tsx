import { useContent } from "../../../data/content";
import { BrandCard } from "./BrandCard";

/**
 * The `brand` band, one of the page's numbered run.
 *
 * Its heading, its number and its anchor are not here: they are in
 * src/content/pageLayout.json, and src/App.tsx wraps this in `PageSection`
 * with them. What is here is the arrangement and nothing else.
 *
 * src/components/PageBodies.tsx is what maps the name to this component.
 */
export function BrandPresenceSection() {
  const { brandPresenceData } = useContent();
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {brandPresenceData.map((item, idx) => (
        <BrandCard key={idx} item={item} />
      ))}
    </div>
  );
}
