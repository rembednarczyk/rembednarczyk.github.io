/**
 * A featured programme leads the band, full-width; everything else keeps the
 * order the content file gives it. A stable sort, so two featured entries
 * would also stay in their written order. Its own module rather than an
 * export beside the section component, which Fast Refresh cannot hot-swap.
 */
export function leadWithFeatured<T extends { featured?: boolean }>(projects: readonly T[]): T[] {
  return [...projects].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
}
