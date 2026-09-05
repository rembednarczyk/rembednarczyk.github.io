import type { PickMessage } from "./protocol";

/**
 * Where on the page a piece of content is edited — the attribute a card
 * carries so the live preview can go the other way.
 *
 * The seam ran one way: the editor posts content, the preview draws it and
 * reports where its sections sit. A click in the preview has nowhere to
 * land in the editor unless the page says, at the element clicked, which
 * file and which entry drew it. So every card the page maps from a list
 * carries `data-edit="keyProjects.json#projects[2]"`: the file as the
 * editor names it, then the entry's path in the editor's own notation for
 * one — `projects[2]` is the third project, whatever the page's order
 * happens to be. A band drawn from a whole file rather than an entry of it
 * (the hero, the quote) carries the file alone, `hero.json`.
 *
 * The same attribute is what the preview lights when the editor says which
 * entry has the cursor, so both directions read one mark. It is on the
 * deployed page too, not only the preview: a few dozen short attributes,
 * measured in the pull request that added them, against a second render
 * path that could drift from the one that deploys.
 */

/** The attribute name, for the preview's queries and the tests. */
export const EDIT_ATTRIBUTE = "data-edit";

/** What the attribute says: which file, and which entry of it, if any. */
export interface EditPlace {
  file: string;
  where: string | null;
}

/** The attribute value that says this. */
export function editOf({ file, where }: EditPlace): string {
  return where === null ? file : `${file}#${where}`;
}

/** The attribute value for a content file by its key — `hero` — or one entry of it. */
export function editValue(key: string, where: string | null = null): string {
  return editOf({ file: `${key}.json`, where });
}

/** The attribute value for the `index`th entry of `list` in the file `key`. */
export function entryEdit(key: string, list: string, index: number): string {
  return editValue(key, `${list}[${String(index)}]`);
}

/** Read the attribute back. Null for a value the page would not have written. */
export function parseEdit(value: string): EditPlace | null {
  const match = /^([A-Za-z]+\.json)(?:#(.+))?$/.exec(value);
  if (match?.[1] === undefined) return null;

  return { file: match[1], where: match[2] ?? null };
}

/** The element carrying this attribute value, or null for none. */
export function cardFor(root: ParentNode, value: string): Element | null {
  for (const card of root.querySelectorAll(`[${EDIT_ATTRIBUTE}]`)) {
    if (card.getAttribute(EDIT_ATTRIBUTE) === value) return card;
  }
  return null;
}

/**
 * What a click on this element picks: the entry of the nearest card that
 * carries one, else the section the click landed in by the id the page
 * renders for it, else nothing.
 */
export function pickAt(element: Element): PickMessage | null {
  const value = element.closest(`[${EDIT_ATTRIBUTE}]`)?.getAttribute(EDIT_ATTRIBUTE);
  const edit = value == null ? null : parseEdit(value);
  if (edit !== null) return { type: "preview:pick", ...edit };

  const id = element.closest("section[id]")?.getAttribute("id");
  return id != null && id !== "" ? { type: "preview:pick", id } : null;
}
