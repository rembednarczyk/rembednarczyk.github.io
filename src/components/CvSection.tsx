import { ElementType, ReactNode } from "react";

/**
 * A headed block of the printed CV.
 *
 * Seven of them wrote out the same two lines: a section carrying the print
 * rules, and a heading carrying nine classes and an icon. All seven were
 * identical, which is the good case and the fragile one — the next hand to
 * touch one of them is the hand that makes it six and one.
 *
 * `print:break-inside-avoid` is the reason this file is watched by a gate.
 * It keeps a section off two sheets, and it costs the gaps the printed CV
 * runs with: a block too tall for the space left moves whole and leaves the
 * foot of the sheet blank. That is a chosen trade, recorded in
 * scripts/printedCv.ts, and it lives here now so it cannot be dropped from
 * one section without being dropped from all of them.
 */

export interface CvSectionProps {
  /** Lucide components are passed as the type, not as an element. */
  icon: ElementType;
  title: string;
  children: ReactNode;
}

export function CvSection({ icon: Icon, title, children }: CvSectionProps) {
  return (
    <section className="mb-8 print:mb-6 print:break-inside-avoid">
      <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
        <Icon size={20} className="text-slate-400" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}
