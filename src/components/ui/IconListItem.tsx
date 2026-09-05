import { ElementType } from "react";

/**
 * A line of prose with an icon beside it, in a card.
 *
 * The achievements and the community entries rendered this separately and
 * identically — the same list item, the same icon slot, the same paragraph,
 * the same six hover and active classes. The only real difference was where
 * the icon came from: the achievements all use one, the community entries
 * each bring their own.
 */

export interface IconListItemProps {
  /** Lucide components are passed as the type, not as an element. */
  icon: ElementType;
  children: string;
  /** Where this line is edited, for the live preview — see src/preview/edit.ts. */
  edit?: string;
}

export function IconListItem({ icon: Icon, children, edit }: IconListItemProps) {
  return (
    <li
      data-edit={edit}
      className="group flex items-start gap-4 bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/5 hover:border-cyan-400/30 active:scale-[0.98] active:bg-white/5 active:border-cyan-400/30 transition-all duration-300"
    >
      <div className="mt-1">
        <Icon
          className="text-cyan-400 group-hover:scale-110 group-active:scale-110 transition-transform duration-300"
          size={24}
          aria-hidden="true"
        />
      </div>
      <p className="text-slate-300 text-lg leading-relaxed group-hover:text-white group-active:text-white transition-colors">
        {children}
      </p>
    </li>
  );
}
