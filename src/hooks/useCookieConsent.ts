import { useCallback, useEffect, useState } from "react";
import { loadAnalyticsTag } from "../lib/analyticsTag";

export type ConsentChoice = "granted" | "denied";
export type ConsentState = ConsentChoice | "unset";

export const CONSENT_STORAGE_KEY = "cookie-consent";

/**
 * Reads a previously stored choice. Storage can throw in private mode or
 * when the browser blocks site data, in which case we treat consent as
 * not yet given and keep analytics denied.
 */
export function readStoredConsent(): ConsentState {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : "unset";
  } catch {
    return "unset";
  }
}

/**
 * Owns the visitor's analytics choice and mirrors it into Google Consent
 * Mode. The gtag default is set to denied in index.html before the tag
 * loads, so nothing is stored until this grants it.
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(readStoredConsent);

  /**
   * The tag is fetched here rather than from index.html, so that a visitor
   * who has not accepted — or who declined — makes no request to Google at
   * all. This covers both the returning visitor whose yes is already stored
   * and the one who accepts during this visit.
   */
  useEffect(() => {
    if (consent === "granted") loadAnalyticsTag();
  }, [consent]);

  const choose = useCallback((choice: ConsentChoice) => {
    setConsent(choice);

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Choice still applies to this page view even if it cannot persist.
    }

    window.gtag?.("consent", "update", { analytics_storage: choice });
  }, []);

  const accept = useCallback(() => choose("granted"), [choose]);
  const decline = useCallback(() => choose("denied"), [choose]);

  /**
   * Clears the stored choice and re-denies analytics storage, which brings
   * the banner back. Withdrawing consent has to be as easy as giving it.
   */
  const reset = useCallback(() => {
    setConsent("unset");

    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      // Nothing persisted, so there is nothing to clear.
    }

    window.gtag?.("consent", "update", { analytics_storage: "denied" });
  }, []);

  return { consent, accept, decline, reset };
}
