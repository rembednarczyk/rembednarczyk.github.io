import { recognitionData } from "../../../data/portfolioFacts";
import { AwardCard } from "./AwardCard";

export function RecognitionSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recognitionData.map((award, idx) => (
        <AwardCard key={idx} award={award} />
      ))}
    </div>
  );
}
