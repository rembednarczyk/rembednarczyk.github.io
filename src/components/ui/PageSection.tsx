import { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * A numbered section of the page: the anchor the navigation scrolls to, the
 * reveal as it comes into view, and the heading above the content.
 *
 * Ten sections wrote this out themselves, and nine of them were the same
 * twenty-three lines with four words changed. That is nine places to edit
 * when the reveal changes, and nine chances for one of them to be missed —
 * which had already happened elsewhere: ThinkingSection reveals with a
 * different distance and easing, and NotFound is the only component in the
 * repository that suppresses its slide for a visitor who asked for reduced
 * motion.
 *
 * The grid stays with the caller. Six different ones are in use and they
 * are a real difference, not an accident: a list of achievements is one
 * column, the skills are four.
 */

export interface PageSectionProps {
  /** The id the navigation scrolls to, and the scroll spy watches. */
  id: string;
  /** Shown before the title, as the design numbers the sections. */
  number: string;
  title: string;
  children: ReactNode;
}

export function PageSection({ id, number, title, children }: PageSectionProps) {
  return (
    <section id={id} className="py-24">
      <Reveal>
        <SectionHeading number={number} title={title} />

        {children}
      </Reveal>
    </section>
  );
}
