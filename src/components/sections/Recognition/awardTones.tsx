import { ReactNode } from "react";
import { Award, BadgeCheck, Medal, Sparkles, Star, Trophy } from "lucide-react";
import { AwardTone } from "../../../types";

/**
 * What each award tone looks like. This used to live in the data module as
 * three Tailwind class strings per award, which meant the list of awards
 * could not be read by anything that does not render React; then in the
 * card's own file, until `tests/accentContrast.test.ts` needed to read it
 * without importing a component.
 *
 * The three the awards wear — gold, cyan, purple — and the three on offer to
 * the editor (OFFERED_AWARD_TONES in `src/data/vocabulary.ts`) that no award
 * wears yet: emerald, rose, blue. Each text class is the 400 shade the
 * others are, and each is measured against the card's ground by that test.
 */
export const TONES: Record<
  AwardTone,
  { border: string; gradient: string; text: string; icon: ReactNode }
> = {
  gold: {
    border: "hover:border-yellow-400/50",
    gradient: "from-yellow-400/10 to-transparent",
    text: "text-yellow-400",
    icon: <Star size={32} className="text-yellow-400" />,
  },
  cyan: {
    border: "hover:border-cyan-400/50",
    gradient: "from-cyan-400/10 to-transparent",
    text: "text-cyan-400",
    icon: <Trophy size={32} className="text-cyan-400" />,
  },
  purple: {
    border: "hover:border-purple-400/50",
    gradient: "from-purple-400/10 to-transparent",
    text: "text-purple-400",
    icon: <Award size={32} className="text-purple-400" />,
  },
  emerald: {
    border: "hover:border-emerald-400/50",
    gradient: "from-emerald-400/10 to-transparent",
    text: "text-emerald-400",
    icon: <Medal size={32} className="text-emerald-400" />,
  },
  rose: {
    border: "hover:border-rose-400/50",
    gradient: "from-rose-400/10 to-transparent",
    text: "text-rose-400",
    icon: <Sparkles size={32} className="text-rose-400" />,
  },
  blue: {
    border: "hover:border-blue-400/50",
    gradient: "from-blue-400/10 to-transparent",
    text: "text-blue-400",
    icon: <BadgeCheck size={32} className="text-blue-400" />,
  },
};
