import { CheckCircle } from "lucide-react";
import { achievementsData } from "../../../data/portfolioFacts";
import { IconListItem } from "../../ui/IconListItem";

export function AchievementsSection() {
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
