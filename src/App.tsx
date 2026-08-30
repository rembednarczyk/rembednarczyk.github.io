import { MotionProvider } from "./components/MotionProvider";
import { useAutoPrint } from "./hooks/useAutoPrint";
import { useCookieConsent } from "./hooks/useCookieConsent";
import { useHashTarget } from "./hooks/useHashTarget";
import { isKnownPath } from "./lib/routing";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { ExpertiseSection } from "./components/sections/Expertise/ExpertiseSection";
import { AboutSection } from "./components/sections/About/AboutSection";
import { ThinkingSection } from "./components/sections/ThinkingSection";
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

/** Chooses between the page and the 404 view. */
export default function App() {
  return (
    <MotionProvider>
      {isKnownPath(window.location.pathname) ? (
        <Portfolio />
      ) : (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-500">
          <NotFound />
        </div>
      )}
    </MotionProvider>
  );
}

/**
 * The page itself, with the decision of whether to show it left to App.
 *
 * Exported so it can be mounted without that decision. Storybook serves its
 * preview from /iframe.html, so a story rendering App gets the 404 view: the
 * page-level accessibility scan was reading an error screen and reporting it
 * clean, which is how the first version of that scan passed.
 */
export function Portfolio() {
  // Only the page can be printed; there is nothing on a 404 worth paper.
  useAutoPrint();

  // The sections do not exist when the browser looks for the anchor, so a
  // shared link to one of them has to be honoured here instead.
  useHashTarget();

  // Held here rather than in the footer: the banner and the scroll-to-top
  // button both live in the bottom-right corner, and one of them has to
  // know about the other.
  const { consent, accept, decline, reset } = useCookieConsent();

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
          className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-8"
        >
          <HeroSection />
          <ExpertiseSection />
          <AboutSection />
          <ThinkingSection />
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
        <Footer
          consent={consent}
          onAccept={accept}
          onDecline={decline}
          onReset={reset}
        />

        {/*
          Floating Scroll to Top Button. It stands down while the consent
          banner is up: both sit in the bottom-right corner, and the banner
          is the one asking for an answer. The button's z-50 does not save
          it either — the banner's z-[90] is trapped inside the footer's
          stacking context, so the button paints over the banner rather than
          under it.
        */}
        {consent !== "unset" && <ScrollToTop />}
      </div>

      {/* Print CV Template */}
      <div className="hidden print:block w-full bg-white text-black">
        <CVTemplate />
      </div>
    </div>
  );
}
