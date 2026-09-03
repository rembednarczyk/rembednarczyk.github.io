import { CheckCircle } from "lucide-react";
import { useContent } from "../../../data/content";
import { IconListItem } from "../../ui/IconListItem";

/**
 * The `achievements` band, one of the page's numbered run.
 *
 * Its heading, its number and its anchor are not here: they are in
 * src/content/pageLayout.json, and src/App.tsx wraps this in `PageSection`
 * with them. What is here is the arrangement and nothing else.
 *
 * src/components/PageBodies.tsx is what maps the name to this component.
 */
export function AchievementsSection() {
  const { achievementsData } = useContent();
  return (
    <ul className="grid gap-4 max-w-4xl mx-auto">
      {achievementsData.map((achievement, idx) => (
        <IconListItem key={idx} icon={CheckCircle}>
          {achievement}
        </IconListItem>
      ))}
    </ul>
  );
}
