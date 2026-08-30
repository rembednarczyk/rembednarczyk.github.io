import { brandPresenceData } from "../../../data/portfolioData";
import { BrandCard } from "./BrandCard";
import { PageSection } from "../../ui/PageSection";

export function BrandPresenceSection() {
  return (
    <PageSection id="brand" number="10" title="Community & Brand Presence">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {brandPresenceData.map((item, idx) => (
          <BrandCard key={idx} item={item} />
        ))}
      </div>
    </PageSection>
  );
}
