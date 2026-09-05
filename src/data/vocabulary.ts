/**
 * The names content is allowed to use, and the only place they are written.
 *
 * An editor outside this repository has to offer a choice from a fixed set:
 * an icon for a new project card, an accent for a new skills group, a shape
 * for a section. It cannot read those out of `icons.ts`, `CvBodies.tsx` or
 * `PageBodies.tsx` — those are TypeScript, and the editor is a different
 * program in a different repository that never compiles this one.
 *
 * So the names live here, in a module with no React in it, which the Vite
 * config can load to write `dist/vocabulary.json` at build. The editor
 * fetches that. Nothing is copied and nothing is committed: the file the
 * editor reads is made from this module on every deploy, the same way
 * `/cv-qr-code.png` is drawn rather than checked in.
 *
 * The lists are the source and the registries are held to them by the
 * compiler, not by a test. Each registry is written
 * `satisfies Record<Name, …>`, which is checked in both directions —
 * measured: a missing key is TS1360 and an extra one is TS2353. That is
 * stronger than the check it replaces and costs nothing to run.
 *
 * What still needs a test is the other boundary: content is JSON and no
 * type reaches it, so `tests/icons.test.ts` and the two layout checks hold
 * these names to the names content actually uses.
 */

/**
 * Icons on offer to the editor that no card names yet.
 *
 * The list an editor picks from should be one somebody chose, and until the
 * editor existed the choosing was done by content: a name was on offer
 * because a card used it, and `tests/icons.test.ts` refused any other. An
 * editor changes what "on offer" means — the owner adding a card wants a
 * choice, not the twenty-four icons the cards already wear — so this is
 * the choice, made once, for this site's subjects: testing, quality,
 * leadership, teaching, writing, the community. Each costs the bundle its
 * few hundred bytes for nobody until a card takes it; measured, the
 * twenty-four together cost 6.1 kB of the built page, 2.5 kB gzipped. When
 * a card takes one, `tests/vocabulary.test.ts` says to take it off this
 * list, so the list stays what it says it is.
 */
export const OFFERED_ICONS = [
  "Bot",
  "Briefcase",
  "Bug",
  "Building2",
  "ClipboardCheck",
  "Compass",
  "FileCheck",
  "FlaskConical",
  "Gauge",
  "GitBranch",
  "GraduationCap",
  "Handshake",
  "Medal",
  "Mic",
  "Network",
  "Newspaper",
  "Presentation",
  "Rocket",
  "Sparkles",
  "Star",
  "Target",
  "TestTube",
  "Trophy",
  "Workflow",
] as const;

/**
 * lucide-react ships about fifteen hundred icons and these are the ones on
 * offer: the ones the cards wear, then the ones above. The narrowing is the
 * point: an editor's icon picker should show a list somebody chose, not a
 * search box over an icon set.
 *
 * Canonical names only. `Code2` was here as a deprecated alias whose real
 * name is `CodeXml`, and the two disagreed the moment an icon became a
 * string in content — an alias is what a major version removes.
 */
export const ICON_NAMES = [
  "Award",
  "BadgeCheck",
  "BookOpen",
  "BrainCircuit",
  "BrainCog",
  "Calendar",
  "Code",
  "CodeXml",
  "Cpu",
  "Database",
  "Globe",
  "Heart",
  "IdCard",
  "Image",
  "Layers",
  "Lightbulb",
  "Megaphone",
  "MonitorCog",
  "Rss",
  "ShieldCheck",
  "Terminal",
  "TreePalm",
  "Users",
  "UsersRound",
  ...OFFERED_ICONS,
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/**
 * The accent a card's icon takes. Named rather than written as a class, so
 * the palette stays out of the data — and called `accent` rather than
 * `tone` because an award's tone is a different palette, and one key
 * carrying two vocabularies reads as one palette to anything building a
 * form from the content.
 */
export const ACCENT_NAMES = ["cyan", "purple", "emerald", "orange"] as const;

export type AccentName = (typeof ACCENT_NAMES)[number];

/** How an award card is coloured. Three, and not the four above. */
export const AWARD_TONES = ["gold", "cyan", "purple"] as const;

/** Which shape draws a section of the printed CV. */
export const CV_BODY_NAMES = [
  "summary",
  "skills",
  "experience",
  "community",
  "recognition",
  "certifications",
  "passions",
] as const;

export type CvBodyName = (typeof CV_BODY_NAMES)[number];

/** Which shape draws a band of the page. */
export const PAGE_BODY_NAMES = [
  "hero",
  "expertise",
  "about",
  "thinking",
  "experience",
  "achievements",
  "recognition",
  "skills",
  "certifications",
  "projects",
  "community",
  "brand",
  "contact",
] as const;

export type PageBodyName = (typeof PAGE_BODY_NAMES)[number];

/** Everything the editor needs, as the shape it is served in. */
export interface Vocabulary {
  icons: readonly string[];
  accents: readonly string[];
  awardTones: readonly string[];
  cvBodies: readonly string[];
  pageBodies: readonly string[];
}

export const VOCABULARY: Vocabulary = {
  icons: ICON_NAMES,
  accents: ACCENT_NAMES,
  awardTones: AWARD_TONES,
  cvBodies: CV_BODY_NAMES,
  pageBodies: PAGE_BODY_NAMES,
};
