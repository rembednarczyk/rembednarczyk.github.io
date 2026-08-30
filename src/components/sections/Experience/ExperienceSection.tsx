import { experienceData } from "../../../data/portfolioFacts";
import { ExperienceItem } from "./ExperienceItem";
import { PageSection } from "../../ui/PageSection";

export function ExperienceSection() {
  return (
    <PageSection id="experience" number="03" title="Professional Experience">
      <div className="space-y-8">
        {experienceData.map((job, idx) => (
          <ExperienceItem key={idx} job={job} />
        ))}
      </div>
    </PageSection>
  );
}
