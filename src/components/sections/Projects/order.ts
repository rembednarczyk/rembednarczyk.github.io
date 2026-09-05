/**
 * A featured programme leads the band, full-width; everything else keeps the
 * order the content file gives it. A stable sort, so two featured entries
 * would also stay in their written order. Its own module rather than an
 * export beside the section component, which Fast Refresh cannot hot-swap.
 *
 * Each project comes back with the index it has in the content, because the
 * page's order is not the file's: the card that leads the band may be the
 * fourth project written, and the editor, asked to open "this card", needs
 * the fourth, not the first.
 */
export function leadWithFeatured<T extends { featured?: boolean }>(
  projects: readonly T[],
): { project: T; index: number }[] {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((a, b) => Number(b.project.featured ?? false) - Number(a.project.featured ?? false));
}
