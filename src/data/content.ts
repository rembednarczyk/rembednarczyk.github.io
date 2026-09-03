import { createContext, useContext } from "react";
import {
  achievementsData,
  aboutData,
  cvData,
  experienceData,
  fullCertificationsList,
  heroData,
  recognitionData,
  thinkingQuote,
  yearsOfExperience,
} from "./portfolioFacts";
import {
  brandPresenceData,
  certificationsData,
  communityData,
  expertiseData,
  keyProjectsData,
  skillsData,
} from "./portfolioData";
import pageLayoutContent from "../content/pageLayout.json" with { type: "json" };

/**
 * The one place a component reaches for what the site says.
 *
 * Until now every section imported its own slice of the data layer directly,
 * captured once when the module loaded. That is exactly right for the site
 * as it ships — the content is baked into the build — and exactly wrong for a
 * live preview, where the words have to be able to change under a page that
 * is already on screen. A component cannot re-import a static binding; it can
 * read a context.
 *
 * So the sections read here instead, and the default value is the very same
 * static content they used to import. Rendered normally, with no provider
 * above them, nothing changes — the default is the build, proven equal to
 * the old exports in `content.test.ts`. The seam this opens is one override:
 * the preview mounts a provider whose value was built from edited content
 * rather than the baked-in files, and the same components draw it. (Slice 06
 * of the editor's preview plan.)
 *
 * The presentation slices carry JSX (an icon is a component), so this module
 * is not loadable from a Vite config; the build's JSON-LD reads
 * `portfolioFacts` directly, which stays free of JSX for that reason.
 */
export const STATIC_CONTENT = {
  heroData,
  aboutData,
  thinkingQuote,
  achievementsData,
  recognitionData,
  experienceData,
  cvData,
  fullCertificationsList,
  yearsOfExperience,
  expertiseData,
  skillsData,
  communityData,
  keyProjectsData,
  brandPresenceData,
  certificationsData,
  pageLayout: pageLayoutContent,
};

/** Everything a page needs to draw itself, from one value. */
export type SiteContent = typeof STATIC_CONTENT;

// The default is the build's own content, so a section rendered with no
// provider — every current test and story — draws exactly what it drew before.
const ContentContext = createContext<SiteContent>(STATIC_CONTENT);

export const ContentProvider = ContentContext.Provider;

export function useContent(): SiteContent {
  return useContext(ContentContext);
}
