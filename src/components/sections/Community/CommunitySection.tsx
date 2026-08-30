import { communityData } from "../../../data/portfolioData";
import { IconListItem } from "../../ui/IconListItem";
import { PageSection } from "../../ui/PageSection";

export function CommunitySection() {
  return (
    <PageSection id="community" number="09" title="Community & Leadership">
      <ul className="grid gap-4 max-w-4xl mx-auto">
        {communityData.map((item, idx) => (
          <IconListItem key={idx} icon={item.icon}>
            {item.text}
          </IconListItem>
        ))}
      </ul>
    </PageSection>
  );
}
