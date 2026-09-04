import type { RawContent } from "../data/content";

/**
 * The wire between the editor and this preview, kept apart from the component
 * so its two decisions can be tested without a DOM: whose messages are
 * listened to, and what counts as a content message.
 *
 * The preview renders unsaved content and answers with the page's geometry.
 * Neither should be reachable by a page the owner did not open, so every
 * message is dropped unless its origin is one the editor is served from. The
 * deployed editor's origin is configured at build (`VITE_PREVIEW_EDITOR_ORIGIN`,
 * comma-separated for more than one); localhost is here for developing the two
 * together. This is the same suspicion the editor already aims the other way,
 * treating the site it fetches as untrusted.
 */

/** The path the editor embeds. Served by the SPA's 404 fallback, like every
 *  other client route this site has. */
export const PREVIEW_PATH = "/preview";

/**
 * A comma-separated list of origins, each reduced to a bare origin.
 *
 * `event.origin` is always a bare origin — scheme, host, port, no path, no
 * trailing slash — so an allowed entry has to be one too, and the common way
 * to set `VITE_PREVIEW_EDITOR_ORIGIN` wrong is to paste the editor's URL with
 * the trailing slash a browser shows. `https://x.onrender.com/` never equals
 * `https://x.onrender.com`, so the match failed silently and the preview
 * ignored every edit. `new URL(value).origin` normalises both away; a value
 * too malformed to parse is dropped rather than crashing the module that every
 * preview message passes through.
 */
export function normalizeOrigins(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .flatMap((value) => {
      try {
        return [new URL(value).origin];
      } catch {
        return [];
      }
    });
}

function configuredOrigins(): string[] {
  return normalizeOrigins(
    (import.meta.env as Record<string, string | undefined>)["VITE_PREVIEW_EDITOR_ORIGIN"],
  );
}

const ALLOWED_EDITOR_ORIGINS: readonly string[] = [
  ...configuredOrigins(),
  "http://localhost:3001",
  "http://localhost:5173",
];

/** The origins the preview will take content from — for a diagnostic message
 *  when it drops one it does not know. */
export function allowedEditorOrigins(): readonly string[] {
  return ALLOWED_EDITOR_ORIGINS;
}

export function originAllowed(origin: string): boolean {
  return ALLOWED_EDITOR_ORIGINS.includes(origin);
}

/**
 * Whether a message is shaped like content, without checking whose it is.
 *
 * `isContentMessage` answers "should this be rendered", which requires both a
 * trusted origin and every document present. This answers the narrower "did
 * someone try to send content", so a message that looks like an edit but
 * arrived from an origin the preview does not trust can be reported rather than
 * dropped in silence — the one failure that leaves an owner typing into a
 * preview that never moves.
 */
export function looksLikeContent(data: unknown): boolean {
  return typeof data === "object" && data !== null && (data as Record<string, unknown>)["type"] === "preview:content";
}

/**
 * Whether a message asks the preview to scroll a section into view.
 *
 * The editor sends this when a file is opened, carrying the id of the page
 * band that file feeds — the same anchor the site's own navigation scrolls to.
 * A shape check only, and gated by the origin check like content: only a page
 * the owner opened may move this one. An id that names no element on the page
 * scrolls nowhere, decided where the scroll happens rather than here.
 */
export function isScrollMessage(data: unknown): data is ScrollMessage {
  if (typeof data !== "object" || data === null) return false;

  const message = data as Record<string, unknown>;
  return message["type"] === "preview:scrollTo" && typeof message["id"] === "string" && message["id"] !== "";
}

/** The documents a whole page is built from — every key `buildContent` reads. */
const RAW_KEYS: readonly (keyof RawContent)[] = [
  "hero",
  "about",
  "thinking",
  "achievements",
  "recognition",
  "experience",
  "cv",
  "certifications",
  "expertise",
  "skills",
  "community",
  "keyProjects",
  "brandPresence",
  "certificationsSummary",
  "pageLayout",
];

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Editor → preview: render this content. */
export interface ContentMessage {
  type: "preview:content";
  content: RawContent;
}

/** Editor → preview: scroll this section into view. */
export interface ScrollMessage {
  type: "preview:scrollTo";
  id: string;
}

/** Preview → editor: I am mounted and listening. */
export interface ReadyMessage {
  type: "preview:ready";
}

/** Preview → editor: where each section sits, so a field can be scrolled to. */
export interface GeometryMessage {
  type: "preview:geometry";
  boxes: Record<string, Box>;
}

/** Preview → editor: the content you sent could not be built into a page. */
export interface ErrorMessage {
  type: "preview:error";
  message: string;
}

/**
 * Whether a message is content to render.
 *
 * A shape check, not a full validation: it confirms the envelope and that
 * every document a page needs is present, and leaves the rest to
 * `buildContent`, which throws on content it cannot turn into a page (a tone
 * that is not one of the three, say) — caught by the preview and reported.
 */
export function isContentMessage(data: unknown): data is ContentMessage {
  if (typeof data !== "object" || data === null) return false;

  const message = data as Record<string, unknown>;
  if (message["type"] !== "preview:content") return false;

  const content = message["content"];
  if (typeof content !== "object" || content === null) return false;

  return RAW_KEYS.every((key) => key in content);
}
