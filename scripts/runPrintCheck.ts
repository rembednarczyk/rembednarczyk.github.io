import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api.js";
import { serveDirectory } from "./staticServer.ts";
import {
  MAX_BLANK_SHARE,
  blankShareOf,
  paginationFaults,
  readsAsACv,
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

/** The longest the CV may run before it stops being a CV. */
const MAX_SHEETS = 5;

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
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
    // The page decides what prints; the CV template is what survives
    // print:hidden. Rendering to PDF is what paginates it.
    pdf = new Uint8Array(await page.pdf({ format: "A4", printBackground: true }));
  } finally {
    await browser.close();
    stop();
  }

  const pages = await sheetsOf(pdf);

  console.log(`the printed CV runs to ${pages.length} sheets`);
  for (const page of pages) {
    console.log(
      `  sheet ${page.number}: ${Math.round(blankShareOf(page) * 100)}% blank at the foot`,
    );
  }

  const problems: string[] = [];

  const name = nameTheBuildDeclares();

  if (!readsAsACv(pages, name)) {
    problems.push(
      `no text came back from the PDF, or it does not carry "${name}" — the checks below would pass on an empty document`,
    );
  }

  if (pages.length > MAX_SHEETS) {
    problems.push(`it runs to ${pages.length} sheets, and ${MAX_SHEETS} is the limit`);
  }

  for (const fault of paginationFaults(pages)) problems.push(fault.reason);

  if (problems.length > 0) {
    throw new Error(
      `The printed CV has problems no screen would show:\n  ${problems.join("\n  ")}\n\n` +
        `A sheet more than ${Math.round(MAX_BLANK_SHARE * 100)}% blank usually means a block ` +
        `carries break-inside-avoid and is taller than the space left on the page, so it moved ` +
        `whole and left the gap behind.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
