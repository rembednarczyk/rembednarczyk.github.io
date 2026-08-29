import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CAREER_START,
  cvData,
  experienceData,
  fullCertificationsList,
  recognitionData,
} from "../src/data/portfolioData";

/**
 * Two surfaces exist for machines rather than people: the JSON-LD in
 * index.html, which search engines read, and public/llm.txt, which language
 * models fetch. Both restate facts that live in portfolioData, and neither
 * could import it: one is static HTML that has to be in the document before
 * any script runs, the other is a plain text file.
 *
 * That makes them the same shape as the consent key, and worse in one
 * respect. A person notices when the page is wrong. Nobody reads their own
 * JSON-LD, so a stale employer or a dropped award is told to Google and to
 * every model that crawls the site, for as long as it takes somebody to
 * think of checking.
 *
 * They agreed with the data when this was written. These hold them to it.
 */

const root = resolve(__dirname, "..");
const llm = readFileSync(resolve(root, "public/llm.txt"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");

interface Organization {
  name: string;
}

interface PersonSchema {
  name: string;
  url: string;
  sameAs: string[];
  worksFor: Organization;
  alumniOf: Organization[];
  award: string[];
  knowsAbout: string[];
  address: { addressCountry: string };
}

const jsonLd = JSON.parse(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)![1],
) as PersonSchema;

/** Every company named anywhere in the career, including inside a role. */
const companiesInCareer = experienceData.flatMap((job) => [job.company, job.role]);

const namedInCareer = (name: string) =>
  companiesInCareer.some((text) => text.includes(name));

describe("the structured data search engines read", () => {
  it("names the same person the page does", () => {
    expect(jsonLd.name).toBe(cvData.header.name);
  });

  it("points at the same site and the same profile", () => {
    expect(jsonLd.url).toBe(`https://${cvData.header.website}`);
    expect(jsonLd.sameAs).toContain(`https://${cvData.header.linkedin}`);
  });

  it("states the country the CV states", () => {
    expect(jsonLd.address.addressCountry).toBe(cvData.header.location);
  });

  it("names the current employer as the current employer", () => {
    // experienceData is newest first, so the first entry is the job held now.
    expect(jsonLd.worksFor.name).toBe(experienceData[0].company);
  });

  it("claims no past employer the career does not mention", () => {
    // Acxiom is a client and lives inside the role text rather than in
    // `company`, which is why this looks at both.
    const unknown = jsonLd.alumniOf
      .map((org) => org.name)
      .filter((name) => !namedInCareer(name));

    expect(jsonLd.alumniOf.length).toBeGreaterThan(0);
    expect(
      unknown,
      `these are listed as past employers and appear nowhere in experienceData:\n  ${unknown.join("\n  ")}`,
    ).toEqual([]);
  });

  it("lists every award the page shows, with its year", () => {
    // Formatted as "title (company, year)" by hand. Rebuilt here instead.
    const expected = recognitionData.map(
      (award) => `${award.title} (${award.company}, ${award.issued})`,
    );

    expect(expected.length).toBeGreaterThan(3);
    expected.forEach((award) => expect(jsonLd.award).toContain(award));
  });
});

describe("the profile language models fetch", () => {
  it("gives the same links as the page", () => {
    expect(llm).toContain(`https://${cvData.header.linkedin}`);
    expect(llm).toContain(`https://${cvData.header.website}`);
  });

  it("covers every job, with the period the page shows", () => {
    // The dash differs between the two surfaces: the page renders "2021 -
    // Present" and prose reads better as "2021-Present". Only the years are
    // compared, since that is the fact rather than the punctuation.
    const missing = experienceData
      .map((job) => job.period.split(/\s*[-–]\s*/).map((p) => p.trim()))
      .filter(([from, to]) => !(llm.includes(from) && llm.includes(to)));

    expect(experienceData.length).toBeGreaterThan(3);
    expect(
      missing,
      `these periods appear on the page and not in llm.txt: ${JSON.stringify(missing)}`,
    ).toEqual([]);
  });

  it("names every award the page shows", () => {
    recognitionData.forEach((award) => {
      expect(llm, `llm.txt does not mention "${award.title}"`).toContain(award.title);
      expect(llm).toContain(award.issued);
    });
  });

  /**
   * Credentials are the most checkable thing about a testing career and the
   * one a model summarising this profile would most want. They were missing
   * from llm.txt entirely.
   */
  it("lists every certification the page lists", () => {
    const named = fullCertificationsList.flatMap((group) =>
      group.items.map((item) => item.name),
    );

    expect(named.length).toBeGreaterThan(5);
    named.forEach((name) =>
      expect(llm, `llm.txt does not mention "${name}"`).toContain(name),
    );
  });
});

describe("the years of experience the hero states", () => {
  /**
   * getYearsOfExperience counts from CAREER_START, and the existing test for
   * it asserts the year is 2014, which restates the constant rather than
   * checking it. Add a job that began earlier, or edit the oldest period,
   * and the figure quietly under-reports with nothing to say so.
   */
  it("counts from the year the oldest job began", () => {
    const earliest = Math.min(
      ...experienceData.map((job) => Number(/(\d{4})/.exec(job.period)![1])),
    );

    expect(CAREER_START.getUTCFullYear()).toBe(earliest);
  });

  it("reads a real year out of every period, so the check above has data", () => {
    experienceData.forEach((job) =>
      expect(job.period, `no year in "${job.period}"`).toMatch(/\d{4}/),
    );
  });
});
