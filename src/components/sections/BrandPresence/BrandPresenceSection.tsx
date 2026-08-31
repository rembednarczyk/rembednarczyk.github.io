import { brandPresenceData } from "../../../data/portfolioData";
import { BrandCard } from "./BrandCard";

export function BrandPresenceSection() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {brandPresenceData.map((item, idx) => (
        <BrandCard key={idx} item={item} />
      ))}
    </div>
  );
}
