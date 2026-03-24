import { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { ExpertiseSection } from "./components/sections/Expertise/ExpertiseSection";
import { AboutSection } from "./components/sections/About/AboutSection";
import { ParticleBackground } from "./components/ParticleBackground";
import { CVTemplate } from "./components/CVTemplate";
import { ScrollToTop } from "./components/ui/ScrollToTop";
import { NotFound } from "./components/NotFound";
import { SkillsSection } from "./components/sections/Skills/SkillsSection";
import { CertificationsSection } from "./components/sections/Certifications/CertificationsSection";
import { AchievementsSection } from "./components/sections/Achievements/AchievementsSection";
import { RecognitionSection } from "./components/sections/Recognition/RecognitionSection";
import { ExperienceSection } from "./components/sections/Experience/ExperienceSection";
import { CommunitySection } from "./components/sections/Community/CommunitySection";
import { BrandPresenceSection } from "./components/sections/BrandPresence/BrandPresenceSection";
import { ProjectsSection } from "./components/sections/Projects/ProjectsSection";
import { ContactSection } from "./components/sections/ContactSection";

export default function App() {
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    // Basic SPA routing for 404
    // If the path is not the root path, show the 404 page
    // We also ignore hash changes since those are used for section navigation
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
      setIsNotFound(true);
    }
  }, []);

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-500">
        <NotFound />
      </div>
    );
  }

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
          <ExperienceSection />
          <AchievementsSection />
          <RecognitionSection />
          <SkillsSection />
          <CertificationsSection />
          <ProjectsSection />
          <CommunitySection />
          <BrandPresenceSection />
          <ContactSection />
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
