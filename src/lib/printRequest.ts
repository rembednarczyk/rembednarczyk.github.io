/**
 * The site has a second front door. A QR code printed on other material
 * points at https://remigiuszbednarczyk.com/?print=true, and someone who
 * scans it expects a print dialog, not a homepage to go hunting through.
 *
 * That address is published on paper and cannot be changed retroactively,
 * so what it carries is fixed and tested rather than assumed.
 */

/** The query parameter the printed code carries. */
export const PRINT_PARAM = "print";

/** The value that means it: nothing else counts. */
export const PRINT_VALUE = "true";

/** The address printed on the QR code, in full. */
export const PRINT_URL = `https://remigiuszbednarczyk.com/?${PRINT_PARAM}=${PRINT_VALUE}`;

/**
 * Whether a query string is a request to print.
 *
 * Parsed rather than searched. The previous test was
 * `search.includes("print=true")`, which is also satisfied by
 * `?noprint=true` and `?sprint=true`, so an unrelated parameter that
 * happened to end in the same letters opened a print dialog.
 */
export function isPrintRequest(search: string): boolean {
  return new URLSearchParams(search).get(PRINT_PARAM) === PRINT_VALUE;
}

/**
 * The same address with the print request removed.
 *
 * Printing is a one-off errand, and the parameter outlives it: without
 * this, going back to the page or reloading it opens the dialog again,
 * which reads as the site being stuck rather than as a feature.
 */
export function withoutPrintRequest(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(PRINT_PARAM);

  // No stray "?" to clean up: URL drops it once the query is empty, and the
  // test below holds it to that rather than taking it on trust.
  return url.href;
}
