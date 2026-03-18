import { useState, useEffect, Suspense, lazy } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { ExpertiseSection } from "./components/sections/ExpertiseSection";
import { AboutSection } from "./components/sections/AboutSection";
import { ParticleBackground } from "./components/ParticleBackground";
import { CVTemplate } from "./components/CVTemplate";
import { ScrollToTop } from "./components/ui/ScrollToTop";

const SkillsSection = lazy(() =>
  import("./components/sections/SkillsSection").then((m) => ({
    default: m.SkillsSection,
  })),
);
const AchievementsSection = lazy(() =>
  import("./components/sections/AchievementsSection").then((m) => ({
    default: m.AchievementsSection,
  })),
);
const RecognitionSection = lazy(() =>
  import("./components/sections/RecognitionSection").then((m) => ({
    default: m.RecognitionSection,
  })),
);
const ExperienceSection = lazy(() =>
  import("./components/sections/ExperienceSection").then((m) => ({
    default: m.ExperienceSection,
  })),
);
const CommunitySection = lazy(() =>
  import("./components/sections/CommunitySection").then((m) => ({
    default: m.CommunitySection,
  })),
);
const BrandPresenceSection = lazy(() =>
  import("./components/sections/BrandPresenceSection").then((m) => ({
    default: m.BrandPresenceSection,
  })),
);
const ProjectsSection = lazy(() =>
  import("./components/sections/ProjectsSection").then((m) => ({
    default: m.ProjectsSection,
  })),
);
const ContactSection = lazy(() =>
  import("./components/sections/ContactSection").then((m) => ({
    default: m.ContactSection,
  })),
);

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden print:overflow-visible print:bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-white focus:font-bold focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <div className="print:hidden">
        {/* Interactive Space/IT Background */}
        <ParticleBackground />

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main
          id="main-content"
          itemScope
          itemType="https://schema.org/Person"
          className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20"
        >
          <HeroSection />
          <ExpertiseSection />
          <AboutSection />
          <Suspense
            fallback={
              <div className="py-24 text-center text-slate-500">Loading...</div>
            }
          >
            <SkillsSection />
            <AchievementsSection />
            <RecognitionSection />
            <ExperienceSection />
            <CommunitySection />
            <BrandPresenceSection />
            <ProjectsSection />
            <ContactSection />
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating Scroll to Top Button */}
        <ScrollToTop />
      </div>

      {/* Print CV Template */}
      <div className="hidden print:block w-full bg-white text-black">
        <CVTemplate />
      </div>
    </div>
  );
}
