import { readStoredConsent } from "../hooks/useCookieConsent";

/**
 * What happens after something is caught.
 *
 * Until now the answer was `console.error` and nothing else, which means a
 * failure on a visitor's machine leaves no trace anywhere the owner of the
 * site will ever look. The fallback screen rescues the visitor; it does not
 * rescue the knowledge that they needed rescuing.
 *
 * The report goes to the analytics tag that is already on the page, and
 * only when the visitor has actually granted consent. That is stricter
 * than Consent Mode requires — a denied tag still sends cookieless pings —
 * and it is deliberate: an error description carries more about what
 * somebody was doing than a page view does, so it waits for a yes rather
 * than for the absence of a no.
 */

/**
 * Google truncates an exception description past this, and a value cut by
 * the receiver is a value you cannot search for. Cut it here instead, where
 * the ellipsis says it happened.
 */
const MAX_DESCRIPTION = 150;

/**
 * Name and message only.
 *
 * The stack is deliberately left out: the deployed bundle is minified and
 * has no source map, so every frame reads `at bl (index-DeyIveWb.js:17)`.
 * That is noise in a report and a liability in a URL. What narrows it down
 * instead is `where`, which the call site names.
 */
export function describeError(error: unknown, where: string): string {
  const body =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : `non-error thrown: ${String(error)}`;

  const full = `${where} — ${body}`;
  return full.length <= MAX_DESCRIPTION
    ? full
    : `${full.slice(0, MAX_DESCRIPTION - 1)}…`;
}

/**
 * Logs the failure, and reports it if the visitor allowed that.
 *
 * `fatal` distinguishes the two callers this has: a render error takes the
 * page down and a failed animation frame does not.
 */
export function reportError(
  error: unknown,
  where: string,
  { fatal = false }: { fatal?: boolean } = {},
): void {
  // First, and unconditionally. The console is the one place a failure can
  // be seen without anybody's permission, because it never leaves the
  // machine it happened on.
  console.error(where, error);

  if (readStoredConsent() !== "granted") return;

  try {
    window.gtag?.("event", "exception", {
      description: describeError(error, where),
      fatal,
    });
  } catch {
    // A reporting call that throws must not become the second failure on
    // a page that is already handling its first.
  }
}
