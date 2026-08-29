/**
 * `lastmod` was a date typed by hand, and it sat five months behind the
 * content it described. Nothing would have reported that, because a date in
 * a file is not wrong in any way a build can see.
 *
 * It is now derived at build time instead. The site is rebuilt and deployed
 * on every merge to main, so the build timestamp is the closest thing the
 * repository has to "when this content last changed".
 *
 * The file in `public/` keeps a real date rather than a placeholder, so it
 * stays valid XML on its own and serves correctly in dev.
 */

const LASTMOD = /<lastmod>[^<]*<\/lastmod>/g;

export function countLastmod(xml: string): number {
  return xml.match(LASTMOD)?.length ?? 0;
}

export function stampSitemap(xml: string, builtAt: Date): string {
  const date = builtAt.toISOString().slice(0, 10);
  return xml.replace(LASTMOD, `<lastmod>${date}</lastmod>`);
}
