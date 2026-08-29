/**
 * The site is one page served from GitHub Pages, which answers an unknown
 * path with 404.html. The build makes that a copy of index.html, so the same
 * application decides for itself whether it was reached by a real address or
 * by a dead link.
 */

/** The paths the site is actually served from. */
export const OWN_PATHS = ["/", "/index.html"];

/**
 * Whether a pathname is one the site answers to.
 *
 * Only the path is considered. Section navigation moves by hash and the
 * printed QR code arrives with a query, and neither changes which page the
 * visitor asked for.
 */
export function isKnownPath(pathname: string): boolean {
  return OWN_PATHS.includes(pathname);
}
