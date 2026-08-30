import { skillsData } from "../../../data/portfolioData";
import { SkillCategoryCard } from "./SkillCategoryCard";
import { PageSection } from "../../ui/PageSection";

export function SkillsSection() {
  return (
    <PageSection id="skills" number="06" title="Technologies & Skills">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillsData.map((category, idx) => (
          <SkillCategoryCard key={idx} category={category} />
        ))}
      </div>
    </PageSection>
  );
}
