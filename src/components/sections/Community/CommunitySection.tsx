import { communityData } from "../../../data/portfolioData";
import { IconListItem } from "../../ui/IconListItem";

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
