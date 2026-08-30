import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api.js";
import { serveDirectory } from "./staticServer.ts";
import {
  DRIFT_TOLERANCE,
  EXPECTED_LAYOUT,
  blankShareOf,
  layoutDrift,
  readsAsACv,
  whatADialogAddedToThePrint,
  type PrintedPage,
} from "./printedCv.ts";

/**
 * Prints the site and reads the sheets back.
 *
 * Run through `npm run check:print`, and in CI as its own step, for the
 * same reason as the Lighthouse gate: it needs a browser and it is the
 * only thing that looks at the one artifact nobody sees on a screen.
 */

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const PORT = 5187;

/**
 * Whose CV it should be, read from the structured data the same build
 * wrote into the page rather than typed here. Importing the data module
 * directly is not an option: it reaches a directory import that node's
 * resolver will not follow, and a name copied into this file would be one
 * more place to forget.
 */
function nameTheBuildDeclares(): string {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  const person = /"@type"\s*:\s*"Person"[\s\S]*?"name"\s*:\s*"([^"]+)"/.exec(html);

  if (!person) throw new Error("no Person name in the built page's structured data");
  return person[1];
}

async function sheetsOf(pdf: Uint8Array): Promise<PrintedPage[]> {
  const doc = await getDocument({ data: pdf, useSystemFonts: true }).promise;
  const pages: PrintedPage[] = [];

  for (let number = 1; number <= doc.numPages; number += 1) {
    const page = await doc.getPage(number);
    const height = page.getViewport({ scale: 1 }).height;
    const items = (await page.getTextContent()).items
      // items are TextItem or TextMarkedContent; only the former carries text
      .filter((item): item is TextItem => "str" in item)
      .filter((item) => item.str.trim().length > 0);

    pages.push({
      number,
      height,
      // transform[5] is the text's distance from the foot of the sheet.
      // pdfjs types the matrix as any[], so the number is asserted here
      // rather than spread straight into Math.min.
      lowestText: items.length
        ? Math.min(...items.map((i) => Number(i.transform[5])))
        : height,
      text: items.map((i) => i.str),
    });
  }

  return pages;
}

async function main() {
  if (!existsSync(join(dist, "index.html"))) {
    throw new Error("dist/index.html is missing. Run `npm run build` first.");
  }

  const stop = await serveDirectory(dist, PORT);
  const browser = await chromium.launch();

  let pdf: Uint8Array;
  let withDialogOpen: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
    // The page decides what prints; the CV template is what survives
    // print:hidden. Rendering to PDF is what paginates it.
    pdf = new Uint8Array(await page.pdf({ format: "A4", printBackground: true }));

    // And again with a dialog open, which is a state a visitor can print
    // from: the browser's own print command is exactly what the print
    // stylesheet exists for, and it does not care that a dialog is up. The
    // shell portals into document.body, outside the wrapper that hides the
    // screen page, so this is the one overlay that can reach paper.
    const opened = await page.evaluate(() => {
      const link = [...document.querySelectorAll("button")].find((b) =>
        /privacy policy/i.test(b.textContent ?? ""),
      );
      if (!link) return false;
      link.click();
      return true;
    });
    if (!opened) {
      throw new Error(
        "no control opened the privacy dialog, so the print below proves nothing about a dialog it never opened",
      );
    }
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(600);

    withDialogOpen = new Uint8Array(
      await page.pdf({ format: "A4", printBackground: true }),
    );
  } finally {
    await browser.close();
    stop();
  }

  const pages = await sheetsOf(pdf);
  const withDialog = await sheetsOf(withDialogOpen);

  console.log(`the printed CV runs to ${pages.length} sheets`);
  for (const page of pages) {
    const share = blankShareOf(page);
    const want = EXPECTED_LAYOUT[page.number - 1];
    const note = want === undefined ? " (no recorded value)" : ` (recorded ${Math.round(want * 100)}%)`;
    console.log(`  sheet ${page.number}: ${Math.round(share * 100)}% blank at the foot${note}`);
  }

  const problems: string[] = [];
  const name = nameTheBuildDeclares();

  if (!readsAsACv(pages, name)) {
    problems.push(
      `no text came back from the PDF, or it does not carry "${name}" — everything below would pass on an empty document`,
    );
  }

  const drift = layoutDrift(pages);

  if (drift.lengthChanged) {
    problems.push(
      `it runs to ${pages.length} sheets, and the recorded layout has ${EXPECTED_LAYOUT.length}`,
    );
  }

  for (const sheet of drift.sheets) {
    problems.push(
      Number.isNaN(sheet.expected)
        ? `sheet ${sheet.sheet} is new, and nothing is recorded for it`
        : `sheet ${sheet.sheet} is ${Math.round(sheet.measured * 100)}% blank at the foot, and ${Math.round(sheet.expected * 100)}% was recorded`,
    );
  }

  const leaked = whatADialogAddedToThePrint(pages, withDialog);

  console.log(
    leaked.length === 0
      ? "printing with the privacy dialog open produces the same document"
      : "printing with the privacy dialog open does NOT produce the same document",
  );

  if (leaked.length > 0) {
    throw new Error(
      `An open dialog reaches the printed CV:\n  ${leaked.join("\n  ")}\n\n` +
        `The dialog shell portals into document.body, which puts it outside the print:hidden ` +
        `wrapper in App.tsx, so it needs the rule on itself the way the consent banner and the ` +
        `scroll-to-top button already carry it. A fixed element repeats on every printed page.`,
    );
  }

  if (problems.length > 0) {
    throw new Error(
      `The printed CV no longer lays out the way it was recorded:\n  ${problems.join("\n  ")}\n\n` +
        `Sections and job entries carry break-inside-avoid so that an entry is never split across two ` +
        `sheets, and the gaps are what that costs. If this change is wanted, update EXPECTED_LAYOUT in ` +
        `scripts/printedCv.ts; the tolerance is ${Math.round(DRIFT_TOLERANCE * 100)} points, which a ` +
        `section crossing a page boundary comfortably exceeds.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
