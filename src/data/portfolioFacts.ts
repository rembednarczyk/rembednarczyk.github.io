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
import { AWARD_TONES } from "./vocabulary";
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
 * The list is in vocabulary.ts because the editor has to offer it and
 * cannot compile TypeScript; `AwardTone` is derived from it, so the type
 * and the list are one thing rather than two that agree. The throw below
 * catches a name added in the JSON, where no type reaches — JSON cannot
 * express a union, so without it the tone would be a bare string cast into
 * place and a misspelt one would reach the card as an undefined lookup.
 */
const TONES = AWARD_TONES;

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

/** The raw content the facts are built from — one JSON document per key. */
export interface FactsRaw {
  hero: typeof heroContent;
  about: typeof aboutContent;
  thinking: typeof thinkingContent;
  achievements: typeof achievementsContent;
  recognition: typeof recognitionContent;
  experience: typeof experienceContent;
  cv: typeof cvContent;
  certifications: typeof certificationsContent;
}

/** Everything this module turns content into, in one shape. */
interface Facts {
  heroData: HeroData;
  aboutData: AboutData;
  thinkingQuote: string;
  achievementsData: string[];
  recognitionData: AwardRecord[];
  experienceData: Job[];
  cvData: CvData;
  fullCertificationsList: CredentialGroup[];
}

/**
 * The facts, built from raw content rather than read straight from the
 * imports.
 *
 * The site calls this once at load with the JSON its build baked in, and
 * exports the result below exactly as before. The preview calls it again with
 * edited content, so the same transform — placeholders filled, the award tone
 * checked against the three it may be, the contact rebuilt from its parts —
 * runs on what the owner is typing. One implementation, two callers, so the
 * preview cannot drift from what deploys.
 */
export function buildFacts(raw: FactsRaw): Facts {
  const cv = fillPlaceholders(raw.cv, VALUES);

  return {
    heroData: fillPlaceholders(raw.hero, VALUES),
    aboutData: fillPlaceholders(raw.about, VALUES),
    thinkingQuote: fillPlaceholders(raw.thinking, VALUES).quote,
    achievementsData: fillPlaceholders(raw.achievements, VALUES).items,
    recognitionData: fillPlaceholders(raw.recognition, VALUES).awards.map((award) => ({
      ...award,
      tone: toneOf(award.tone, award.title),
    })),
    experienceData: fillPlaceholders(raw.experience, VALUES).jobs,
    cvData: {
      ...cv,
      header: {
        ...cv.header,
        phone: contactOf(cv.header.phone),
        email: contactOf(cv.header.email),
      },
    },
    fullCertificationsList: fillPlaceholders(raw.certifications, VALUES).groups,
  };
}

/** The build's own content, and the source of the static exports below. */
const STATIC_FACTS_RAW: FactsRaw = {
  hero: heroContent,
  about: aboutContent,
  thinking: thinkingContent,
  achievements: achievementsContent,
  recognition: recognitionContent,
  experience: experienceContent,
  cv: cvContent,
  certifications: certificationsContent,
};

const facts = buildFacts(STATIC_FACTS_RAW);

export const heroData: HeroData = facts.heroData;
export const aboutData: AboutData = facts.aboutData;
export const thinkingQuote: string = facts.thinkingQuote;
export const achievementsData: string[] = facts.achievementsData;
export const recognitionData: AwardRecord[] = facts.recognitionData;
export const experienceData: Job[] = facts.experienceData;
export const cvData: CvData = facts.cvData;
export const fullCertificationsList: CredentialGroup[] = facts.fullCertificationsList;
