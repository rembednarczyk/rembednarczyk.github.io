import { experienceData } from "../../../data/portfolioFacts";
import { ExperienceItem } from "./ExperienceItem";

export function ExperienceSection() {
  return (
    <div className="space-y-8">
      {experienceData.map((job, idx) => (
        <ExperienceItem key={idx} job={job} />
      ))}
    </div>
  );
}
