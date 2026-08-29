/**
 * The navigation model, in one place.
 *
 * It used to live in four: the navbar wrote each destination twice, once for
 * the desktop row and once for the mobile menu, useActiveSection carried the
 * sub-section roll-up as its own if/else chain, and the App test kept a
 * fourth copy to assert against. Adding an entry meant editing all four, and
 * nothing enforced that they agreed. A disagreement raised no error: the link
 * simply stopped lighting up.
 */

export interface NavItem {
  /** The `id` of the section this entry scrolls to. */
  id: string;
  /** What the navbar shows. It does not always match the id. */
  label: string;
  /**
   * Sub-sections that belong under this entry. The scroll spy keeps the
   * parent highlighted while the reader is inside any of them, because the
   * navbar has no link of its own for them.
   */
  covers?: string[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "about", label: "About", covers: ["expertise"] },
  {
    id: "experience",
    label: "Experience",
    covers: ["achievements", "recognition"],
  },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "projects", label: "Initiatives" },
  { id: "community", label: "Community", covers: ["brand"] },
  { id: "contact", label: "Contact" },
];

/**
 * Every section id, including sub-sections, mapped to the nav entry that
 * should light up for it. Derived from NAV_ITEMS so the two cannot disagree.
 */
export const SECTION_TO_NAV_ENTRY: Readonly<Record<string, string>> =
  NAV_ITEMS.reduce<Record<string, string>>((map, item) => {
    map[item.id] = item.id;
    for (const covered of item.covers ?? []) {
      map[covered] = item.id;
    }
    return map;
  }, {});
