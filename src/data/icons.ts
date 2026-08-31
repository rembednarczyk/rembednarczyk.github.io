import {
  Award,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  BrainCog,
  Calendar,
  Code,
  CodeXml,
  Cpu,
  Database,
  Globe,
  Heart,
  IdCard,
  Image,
  Layers,
  Lightbulb,
  Megaphone,
  MonitorCog,
  Rss,
  ShieldCheck,
  Terminal,
  TreePalm,
  Users,
  UsersRound,
} from "lucide-react";
import type { ElementType } from "react";

/**
 * The icons content is allowed to name, and the accents it is allowed to
 * ask for.
 *
 * A card's icon is as much part of its entry as its title — that is why the
 * two used to sit together in one .tsx file, with the icon written as JSX.
 * The cost was that the whole of it, 79 sentences, was unreachable to
 * anything that could not evaluate JSX, which is every editor that is not
 * this repository.
 *
 * So content names an icon and this resolves the name. The narrowing is the
 * point: lucide-react exports about fifteen hundred icons and only these
 * eighteen are on offer, which means the list an editor can choose from is
 * a list somebody decided on rather than a search box over an icon set.
 * `tests/icons.test.ts` fails on an entry here that no content file uses,
 * so the list shrinks when a card stops needing one.
 *
 * Both lookups throw on a name they do not have. JSON reaches no type
 * system, and the alternative to throwing is a card that renders with a
 * hole where its icon was, or with no colour, on a page nobody re-reads
 * after an edit. It earned that on its first run: the project card imported
 * `Code2`, which is a deprecated alias whose canonical name is `CodeXml`,
 * so the two names for one icon disagreed the moment the icon became a
 * string. Registered under the canonical name, since an alias is what a
 * major version removes.
 */
export const ICONS = {
  Award,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  BrainCog,
  Calendar,
  Code,
  CodeXml,
  Cpu,
  Database,
  Globe,
  Heart,
  IdCard,
  Image,
  Layers,
  Lightbulb,
  Megaphone,
  MonitorCog,
  Rss,
  ShieldCheck,
  Terminal,
  TreePalm,
  Users,
  UsersRound,
} satisfies Record<string, ElementType>;

export function iconOf(name: string): ElementType {
  const icon = (ICONS as Record<string, ElementType>)[name];

  if (icon === undefined) {
    throw new Error(
      `content asks for the ${name} icon, and the ones on offer are ${Object.keys(ICONS).join(", ")}`,
    );
  }

  return icon;
}

/**
 * The four accents a card's icon can take, as Tailwind classes.
 *
 * Named in content rather than written there, for the reason `AwardTone`
 * already records: a class string in the data is presentation in the data,
 * and it puts the palette out of reach of anything that is not a component.
 * Four rather than one because the skills, brand and certification cards
 * each cycle through them, and cycling by array index would silently
 * re-colour every card after any entry a person inserts.
 */
export const ACCENTS = {
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  emerald: "text-emerald-400",
  orange: "text-orange-400",
} as const;

export type AccentTone = keyof typeof ACCENTS;

export function accentOf(tone: string): string {
  const accent = (ACCENTS as Record<string, string>)[tone];

  if (accent === undefined) {
    throw new Error(
      `content asks for a ${tone} accent, and there are only ${Object.keys(ACCENTS).join(", ")}`,
    );
  }

  return accent;
}
