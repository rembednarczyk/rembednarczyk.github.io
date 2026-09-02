import { communityData } from "../../../data/portfolioData";
import { IconListItem } from "../../ui/IconListItem";

/**
 * The `community` band, one of the page's numbered run.
 *
 * Its heading, its number and its anchor are not here: they are in
 * src/content/pageLayout.json, and src/App.tsx wraps this in `PageSection`
 * with them. What is here is the arrangement and nothing else.
 *
 * src/components/PageBodies.tsx is what maps the name to this component.
 */
export function CommunitySection() {
  return (
    <ul className="grid gap-4 max-w-4xl mx-auto">
      {communityData.map((item, idx) => (
        <IconListItem key={idx} icon={item.icon}>
          {item.text}
        </IconListItem>
      ))}
    </ul>
  );
}
