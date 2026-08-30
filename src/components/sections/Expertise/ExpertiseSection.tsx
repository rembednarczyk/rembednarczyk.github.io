import { expertiseData } from "../../../data/portfolioData";
import { ExpertiseCard } from "./ExpertiseCard";
import { PageSection } from "../../ui/PageSection";

export function ExpertiseSection() {
  return (
    <PageSection id="expertise" number="01" title="Core Expertise">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expertiseData.map((item, idx) => (
          <ExpertiseCard key={idx} item={item} />
        ))}
      </div>
    </PageSection>
  );
}
