import type { ComponentType } from "react";
import { AboutSection } from "./sections/About/AboutSection";
import { AchievementsSection } from "./sections/Achievements/AchievementsSection";
import { BrandPresenceSection } from "./sections/BrandPresence/BrandPresenceSection";
import { CertificationsSection } from "./sections/Certifications/CertificationsSection";
import { CommunitySection } from "./sections/Community/CommunitySection";
import { ContactSection } from "./sections/ContactSection";
import { ExperienceSection } from "./sections/Experience/ExperienceSection";
import { ExpertiseSection } from "./sections/Expertise/ExpertiseSection";
import { HeroSection } from "./sections/HeroSection";
import { ProjectsSection } from "./sections/Projects/ProjectsSection";
import { RecognitionSection } from "./sections/Recognition/RecognitionSection";
import { SkillsSection } from "./sections/Skills/SkillsSection";
import { ThinkingSection } from "./sections/ThinkingSection";

/**
 * What each of the page's bands draws, by the name content calls it.
 *
 * The same split the printed CV got, for the same reason. Which bands
 * appear, in what order and under what heading is in
 * src/content/pageLayout.json; what any one of them draws is here, because
 * a grid of expertise cards and a contact form are not two arrangements of
 * one thing.
 *
 * Ten of the thirteen are numbered sections and are wrapped by
 * `PageSection` in the loop that reads the layout. The other three — the
 * hero, the quote band and the contact form — render their own element and
 * always did: they are not entries in a numbered run, and giving them a
 * heading they do not have to satisfy a uniform shape would put words on
 * the page that nobody asked for.
 */
const BODIES: Record<string, ComponentType> = {
  hero: HeroSection,
  expertise: ExpertiseSection,
  about: AboutSection,
  thinking: ThinkingSection,
  experience: ExperienceSection,
  achievements: AchievementsSection,
  recognition: RecognitionSection,
  skills: SkillsSection,
  certifications: CertificationsSection,
  projects: ProjectsSection,
  community: CommunitySection,
  brand: BrandPresenceSection,
  contact: ContactSection,
};

export function pageBodyOf(name: string): ComponentType {
  const body = BODIES[name];

  if (body === undefined) {
    throw new Error(
      `the page layout asks for a ${name} band, and the ones that exist are ${Object.keys(BODIES).join(", ")}`,
    );
  }

  return body;
}

/** Every band this page knows how to draw, for the guard to read. */
export const PAGE_BODIES = Object.keys(BODIES);
