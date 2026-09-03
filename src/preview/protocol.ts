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

function configuredOrigins(): string[] {
  const raw = (import.meta.env as Record<string, string | undefined>)[
    "VITE_PREVIEW_EDITOR_ORIGIN"
  ];

  return (raw ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

const ALLOWED_EDITOR_ORIGINS: readonly string[] = [
  ...configuredOrigins(),
  "http://localhost:3001",
  "http://localhost:5173",
];

export function originAllowed(origin: string): boolean {
  return ALLOWED_EDITOR_ORIGINS.includes(origin);
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
