import {
  SkillCategory,
  Certification,
  Expertise,
  CommunityItem,
  KeyProject,
  BrandItem,
} from "../types";
import { ACCENTS, accentOf, iconOf } from "./icons";
import brandPresenceContent from "../content/brandPresence.json" with { type: "json" };
import certificationsSummaryContent from "../content/certificationsSummary.json" with { type: "json" };
import communityContent from "../content/community.json" with { type: "json" };
import expertiseContent from "../content/expertise.json" with { type: "json" };
import keyProjectsContent from "../content/keyProjects.json" with { type: "json" };
import skillsContent from "../content/skills.json" with { type: "json" };

/**
 * The cards, and only how they look.
 *
 * What each card says is in src/content, next to everything else the site
 * says. What is here is the part that has to be JSX: the icon a card shows,
 * at the size that card draws it and in the accent its entry asked for.
 *
 * The split this module used to describe — facts in portfolioFacts.ts, "the
 * presentation that belongs to a single card" here — was drawn in the wrong
 * place for the wrong reason. It was drawn around what the *build* could
 * load, so 79 sentences stayed on this side of it purely because each was
 * written next to an `<Icon />`, and no editor outside this repository
 * could reach them. The line is drawn around what a person edits now: the
 * words are content, the icon is a name in that content, and the size and
 * the accent are decided here, once per card type, where a designer would
 * look for them.
 *
 * The comment this replaces claimed everything in portfolioFacts.ts was
 * re-exported here so a component could import the whole set from one
 * module. Nothing was: there is no re-export and there never was, and the
 * eight components that read facts all import them directly. A comment is
 * not held to the code by anything, which is why the guards in this
 * repository are checks and not prose.
 */

/** Every card type's own drawing, in one place rather than per entry. */
const SIZES = { expertise: 24, project: 32, projectLink: 20, brand: 32, certification: 24 };
const BRAND_ICON = "mb-4 group-hover:scale-110 transition-transform duration-300";

/**
 * The one card type whose accent does not vary. Measured: all six of these
 * icons are cyan, so it is a decision about the section rather than data
 * about an entry, and content does not carry a colour it never chooses.
 */
export const expertiseData: Expertise[] = expertiseContent.areas.map((area) => {
  const Icon = iconOf(area.icon);
  return {
    title: area.title,
    desc: area.desc,
    icon: <Icon size={SIZES.expertise} className={ACCENTS.cyan} />,
  };
});

export const skillsData: SkillCategory[] = skillsContent.categories.map((category) => {
  const Icon = iconOf(category.icon);
  return {
    name: category.name,
    icon: <Icon className={accentOf(category.accent)} />,
    skills: category.skills,
  };
});

export const communityData: CommunityItem[] = communityContent.items.map((item) => ({
  text: item.text,
  icon: iconOf(item.icon),
}));

export const keyProjectsData: KeyProject[] = keyProjectsContent.projects.map((project) => {
  const Icon = iconOf(project.icon);
  return {
    title: project.title,
    desc: project.desc,
    tags: project.tags,
    mainIcon: <Icon size={SIZES.project} />,
    ...("links" in project
      ? {
          links: project.links.map((link) => {
            const LinkIcon = iconOf(link.icon);
            return { url: link.url, icon: <LinkIcon size={SIZES.projectLink} /> };
          }),
        }
      : {}),
  };
});

export const brandPresenceData: BrandItem[] = brandPresenceContent.items.map((item) => {
  const Icon = iconOf(item.icon);
  return {
    title: item.title,
    desc: item.desc,
    icon: <Icon size={SIZES.brand} className={`${accentOf(item.accent)} ${BRAND_ICON}`} />,
  };
});

/**
 * The screen list and `fullCertificationsList` are deliberately not the
 * same, and should not be merged.
 *
 * The print CV is tailored so a reader is not flooded, so it carries the
 * full official certificate names and the complete training history. This
 * list is the shorter, readable summary the page shows. An earlier review
 * read the difference as drift and proposed unifying them; it is a choice,
 * recorded here so the next reader does not undo it. The two content files
 * are named for the difference: `certifications.json` is the print record,
 * `certificationsSummary.json` is what the page shows.
 */
export const certificationsData: Certification[] = certificationsSummaryContent.groups.map(
  (group) => {
    const Icon = iconOf(group.icon);
    return {
      title: group.title,
      items: group.items,
      icon: <Icon size={SIZES.certification} className={accentOf(group.accent)} />,
    };
  },
);
