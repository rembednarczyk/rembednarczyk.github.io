import { aboutData } from "../../../data/portfolioFacts";
import { AboutImage } from "./AboutImage";
import { PageSection } from "../../ui/PageSection";

export function AboutSection() {
  return (
    <PageSection id="about" number="02" title="About me">
      <div className="grid md:grid-cols-2 gap-12 items-center print:grid-cols-1 print:gap-4">
        <div className="space-y-4 text-slate-400 leading-relaxed">
          {aboutData.paragraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
        <AboutImage
          imageUrl={aboutData.imageUrl}
          width={aboutData.imageWidth}
          height={aboutData.imageHeight}
        />
      </div>
    </PageSection>
  );
}
