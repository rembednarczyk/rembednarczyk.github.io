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
 * A bundle filename and position, and nothing longer. Long enough for
 * `index-DeyIveWb.js:17:72594`, short enough that it can never crowd the
 * message out of the description.
 */
const MAX_LOCATION = 48;

/**
 * The bundle file and position of the frame the error came from, without
 * the origin: `index-DeyIveWb.js:17:72594`.
 *
 * Minified on its own, and that is the point — the build publishes source
 * maps, so this resolves back to a file and a line. A whole stack would not
 * fit in a report and would mostly repeat the framework; the innermost
 * frame is the one that says where.
 */
export function firstFrame(error: unknown): string {
  if (!(error instanceof Error) || typeof error.stack !== "string") return "";

  for (const line of error.stack.split("\n")) {
    // Deliberately anchored on the last path segment, so the match is the
    // same shape whether the runtime writes `at fn (url)` or `fn@url`, and
    // no origin ends up in the report.
    const frame = /([^/\\()\s]+:\d+:\d+)/.exec(line);
    if (frame) return frame[1].slice(0, MAX_LOCATION);
  }

  return "";
}

/**
 * Name, message, and where in the bundle it came from.
 *
 * The location is appended last and never dropped: a long message is cut to
 * make room for it, because a description without it says what broke and
 * not where, which was the whole complaint about the first version of this.
 */
export function describeError(error: unknown, where: string): string {
  const body =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : `non-error thrown: ${String(error)}`;

  const location = firstFrame(error);
  const suffix = location ? ` @ ${location}` : "";
  const room = MAX_DESCRIPTION - suffix.length;

  const head = `${where} — ${body}`;
  const trimmed = head.length <= room ? head : `${head.slice(0, room - 1)}…`;

  return trimmed + suffix;
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
