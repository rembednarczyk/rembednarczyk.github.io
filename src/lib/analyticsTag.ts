/**
 * Loads the analytics tag, and only once somebody has said yes.
 *
 * index.html used to carry `<script async src="…googletagmanager.com…">`
 * next to the Consent Mode defaults. Those defaults did their job — no
 * cookie was written before consent — but the request for the script went
 * out on every visit regardless, and a request is not nothing: it hands
 * Google the visitor's IP address, user agent and referring page. The
 * preconnect above it opened the TLS connection earlier still.
 *
 * The privacy policy this site serves says that no measurement data is
 * collected until the banner is accepted. Both could not be true, and of
 * the two, the policy is the one worth keeping.
 */

/** The property the inline block in index.html configures. */
export const MEASUREMENT_ID = "G-ZJPCFFZWSB";

export const TAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;

/** Marks the injected element, so a second call can recognise its own work. */
export const TAG_ELEMENT_ID = "ga-tag";

/**
 * Adds the tag to the document if it is not already there.
 *
 * Callers may run this on every render and on every consent change, so it
 * has to be idempotent: a second script element would mean a second
 * pageview from one visit.
 *
 * The dataLayer already holds the `consent default`, the stored opt-in and
 * the `config` call queued by index.html, so the tag reads all of it as
 * soon as it runs — the ordering that matters is preserved by queueing
 * rather than by loading early.
 */
export function loadAnalyticsTag(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(TAG_ELEMENT_ID)) return;

  const script = document.createElement("script");
  script.id = TAG_ELEMENT_ID;
  script.async = true;
  script.src = TAG_SRC;

  document.head.appendChild(script);
}
