import { skillsData } from "../../../data/portfolioData";
import { SkillCategoryCard } from "./SkillCategoryCard";

export function SkillsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {skillsData.map((category, idx) => (
        <SkillCategoryCard key={idx} category={category} />
      ))}
    </div>
  );
}
