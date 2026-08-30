import { certificationsData } from "../../../data/portfolioData";
import { CertificationCard } from "./CertificationCard";
import { PageSection } from "../../ui/PageSection";

export function CertificationsSection() {
  return (
    <PageSection id="certifications" number="07" title="Certifications & Credentials">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificationsData.map((item, idx) => (
          <CertificationCard key={idx} item={item} />
        ))}
      </div>
    </PageSection>
  );
}
