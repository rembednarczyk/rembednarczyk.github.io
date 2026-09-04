/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * The day the content last changed, `YYYY-MM-DD`, defined by vite.config.ts
   * at build from the last commit touching src/content (scripts/contentDate.ts).
   * Absent under vitest and in a dev server, so it is optional here and every
   * reader renders nothing without it.
   */
  readonly VITE_CONTENT_UPDATED?: string;
}
