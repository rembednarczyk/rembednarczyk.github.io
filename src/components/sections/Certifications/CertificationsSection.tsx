import { certificationsData } from "../../../data/portfolioData";
import { CertificationCard } from "./CertificationCard";

export function CertificationsSection() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificationsData.map((item, idx) => (
        <CertificationCard key={idx} item={item} />
      ))}
    </div>
  );
}
