import {
  AboutData,
  AwardRecord,
  AwardTone,
  CredentialGroup,
  CvContact,
  CvData,
  HeroData,
  Job,
} from "../types";
import { getYearsOfExperience } from "../utils/domain";
import { fillPlaceholders } from "./placeholders";
// The attributes are not decoration. Vite 8 loads this module into its own
// config to build the JSON-LD, and warns on a JSON import without them:
// what a specifier resolves to stops being inferred from its extension.
import aboutContent from "../content/about.json" with { type: "json" };
import achievementsContent from "../content/achievements.json" with { type: "json" };
import certificationsContent from "../content/certifications.json" with { type: "json" };
import cvContent from "../content/cv.json" with { type: "json" };
import experienceContent from "../content/experience.json" with { type: "json" };
import heroContent from "../content/hero.json" with { type: "json" };
import recognitionContent from "../content/recognition.json" with { type: "json" };
import thinkingContent from "../content/thinking.json" with { type: "json" };

/**
 * Everything the site states as fact, with nothing about how it looks.
 *
 * The words themselves are no longer here. They are in src/content as JSON,
 * one file per thing the site says, and this module is what turns them into
 * the typed shapes the page and the build read. The split is what an editor
 * outside this repository needs: a file it can rewrite whole without
 * touching a language, and a layer here that decides whether what it wrote
 * is usable.
 *
 * It stays a .ts file, and still carries no JSX, for the reason it always
 * did: the build reads it to write the JSON-LD that search engines parse
 * and the profile that language models fetch, and a module carrying JSX
 * icons and Tailwind class names cannot be loaded from a Vite config.
 * Presentation that belongs to a single card stayed with that card's data
 * in portfolioData.tsx.
 *
 * What is deliberately still code, rather than content:
 *
 *   - the career start and the years counted from it, which are a
 *     computation and not a sentence;
 *   - the contact details, kept in parts so no source file and no shipped
 *     bundle carries a whole address;
 *   - the award tone, which is one of three names and is checked to be.
 */

/**
 * First professional testing role, matching the earliest entry in
 * experienceData below. Kept as a real date rather than parsed out of the
 * `period` display string, which is formatted for reading and would break
 * the moment its wording changes. tests/botLayer.test.ts holds the two to
 * each other.
 */
export const CAREER_START: Date = new Date("2014-01-01T00:00:00Z");

/** Recomputed on every page load, so it never goes stale. */
export const yearsOfExperience: number = getYearsOfExperience(CAREER_START);

/** What content may ask for by name. See placeholders.ts. */
const VALUES = { yearsOfExperience: String(yearsOfExperience) };

/**
 * The three card colours, named in the data and drawn by AwardCard.
 *
 * `satisfies` catches a fourth name added here; the throw catches one added
 * in the JSON, where no type reaches. JSON cannot express a union, so
 * without this the tone would be a bare string cast into place and a
 * misspelt one would reach the card as an undefined lookup.
 */
const TONES = ["gold", "cyan", "purple"] as const satisfies readonly AwardTone[];

function toneOf(value: string, title: string): AwardTone {
  const tone = TONES.find((known) => known === value);

  if (tone === undefined) {
    throw new Error(`"${title}" asks for a ${value} card, and there are only ${TONES.join(", ")}`);
  }

  return tone;
}

/**
 * A detail the content keeps in pieces: the parts a reader sees, and the
 * parts the href is built from, which differ for the phone number because
 * its display grouping is spaces and its `tel:` value is not.
 */
function contactOf({ display, href }: { display: string[]; href: string[] }): CvContact {
  return { display, href: href.join("") };
}

export const heroData: HeroData = fillPlaceholders(heroContent, VALUES);

export const aboutData: AboutData = fillPlaceholders(aboutContent, VALUES);

export const thinkingQuote: string = fillPlaceholders(thinkingContent, VALUES).quote;

export const achievementsData: string[] = fillPlaceholders(achievementsContent, VALUES).items;

export const recognitionData: AwardRecord[] = fillPlaceholders(
  recognitionContent,
  VALUES,
).awards.map((award) => ({ ...award, tone: toneOf(award.tone, award.title) }));

export const experienceData: Job[] = fillPlaceholders(experienceContent, VALUES).jobs;

const cv = fillPlaceholders(cvContent, VALUES);

export const cvData: CvData = {
  ...cv,
  header: {
    ...cv.header,
    phone: contactOf(cv.header.phone),
    email: contactOf(cv.header.email),
  },
};

export const fullCertificationsList: CredentialGroup[] = fillPlaceholders(
  certificationsContent,
  VALUES,
).groups;
