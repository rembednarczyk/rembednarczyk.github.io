import { expertiseData } from "../../../data/portfolioData";
import { ExpertiseCard } from "./ExpertiseCard";

export function ExpertiseSection() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expertiseData.map((item, idx) => (
        <ExpertiseCard key={idx} item={item} />
      ))}
    </div>
  );
}
