import { useEffect } from "react";

/**
 * Holds the page still while an overlay is open.
 *
 * This lived inside useModalA11y, which is about focus. Locking the page is a
 * different concern that happened to share a lifecycle, and keeping them
 * together meant every dialog carried its own idea of what `overflow` should
 * be. Two overlays open at once, or one closing while another is still open,
 * and the last cleanup to run decides for the whole page: the first would
 * release the lock the second still needs.
 *
 * The count below is what makes that safe. The style is set when the first
 * caller locks and restored when the last one releases, so overlapping locks
 * compose instead of fighting.
 */

let holders = 0;
let restoreTo = "";

/** Exposed for tests. Reading the count is the only way to observe nesting. */
export function scrollLockHolders(): number {
  return holders;
}

function acquire() {
  if (holders === 0) {
    restoreTo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  holders += 1;
}

function release() {
  holders = Math.max(0, holders - 1);
  if (holders === 0) {
    document.body.style.overflow = restoreTo;
  }
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    acquire();
    return release;
  }, [active]);
}
