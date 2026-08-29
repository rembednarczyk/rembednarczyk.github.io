import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CONSENT_STORAGE_KEY } from "../src/hooks/useCookieConsent";

/**
 * The visitor's analytics choice is read in two places that cannot import
 * each other.
 *
 * The app reads it through useCookieConsent. index.html reads it too, in
 * plain JavaScript, because the choice has to be re-applied before gtag.js
 * loads: after that the tag has already decided whether to write. Nothing
 * ties the two spellings together, and a rename would break the second one
 * in silence. The visitor who once opted in simply stops being counted, and
 * the site looks entirely healthy.
 *
 * The third copy, the key quoted to the visitor in the privacy policy, is a
 * statement of fact to a data subject about where their data is kept. It is
 * rendered from the constant now, and checked here as well.
 */

const root = resolve(__dirname, "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");

/** Consent Mode v2 storage types. security_storage is exempt by design. */
const DENIED_BY_DEFAULT = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
  "functionality_storage",
  "personalization_storage",
];

describe("the consent key", () => {
  it("is the same one index.html reads", () => {
    expect(html).toContain(`localStorage.getItem('${CONSENT_STORAGE_KEY}')`);
  });

  it("is quoted to the visitor from the constant, not typed out again", () => {
    const policy = readFileSync(
      resolve(root, "src/components/ui/PrivacyPolicyModal.tsx"),
      "utf8",
    );

    expect(policy).toContain("{CONSENT_STORAGE_KEY}");
    // A literal here would be a claim about where a person's data lives,
    // maintained by hand and true only until someone renames the constant.
    expect(policy).not.toContain(`>${CONSENT_STORAGE_KEY}<`);
  });
});

describe("Consent Mode defaults in index.html", () => {
  /**
   * The order is the whole point. gtag.js decides whether to write storage
   * when it loads, so the denial has to be queued before the tag arrives.
   *
   * This used to check that the denial appeared above the script tag in
   * this file. The tag is no longer in this file at all — it is fetched
   * only after the visitor accepts, because the request itself disclosed
   * the visit before anyone had been asked — so what has to hold now is
   * that the denial is queued into dataLayer during the document, and the
   * document reaches for nothing. tests/consentBeforeTag.test.ts holds the
   * second half; this holds the first.
   */
  it("queues the denial into dataLayer while the document loads", () => {
    const stub = html.indexOf("function gtag()");
    const denial = html.indexOf("gtag('consent', 'default'");
    const firstPageview = html.indexOf("gtag('config'");

    expect(stub).toBeGreaterThan(-1);
    expect(denial).toBeGreaterThan(stub);
    expect(denial).toBeLessThan(firstPageview);
  });

  it.each(DENIED_BY_DEFAULT)("denies %s", (storage) => {
    const block = html.slice(
      html.indexOf("gtag('consent', 'default'"),
      html.indexOf("gtag('js'"),
    );

    expect(block).toMatch(new RegExp(`${storage}:\\s*'denied'`));
  });

  it("re-applies an earlier opt-in before the first pageview is sent", () => {
    // Without this a returning visitor who accepted is counted as denied
    // until they interact, so their session goes missing.
    const reapply = html.indexOf(`localStorage.getItem('${CONSENT_STORAGE_KEY}')`);
    const firstPageview = html.indexOf("gtag('config'");

    expect(reapply).toBeGreaterThan(-1);
    expect(reapply).toBeLessThan(firstPageview);
  });

  it("re-applies only an explicit grant", () => {
    // Anything other than a stored "granted" has to stay denied, including
    // a value the page has never heard of.
    const reapplyBlock = html.slice(
      html.indexOf(`localStorage.getItem('${CONSENT_STORAGE_KEY}')`),
      html.indexOf("gtag('js'"),
    );

    expect(reapplyBlock).toContain("=== 'granted'");
    expect(reapplyBlock).toContain("analytics_storage: 'granted'");
  });

  it("survives a browser that refuses site data", () => {
    // localStorage throws outright in some privacy modes. An unguarded read
    // there would throw before gtag('config') and take analytics, and every
    // script after it on the page, down with it.
    const guarded = html.slice(
      html.indexOf("try {"),
      html.indexOf("gtag('js'"),
    );

    expect(guarded).toContain(`localStorage.getItem('${CONSENT_STORAGE_KEY}')`);
    expect(guarded).toMatch(/catch\s*\(/);
  });
});
