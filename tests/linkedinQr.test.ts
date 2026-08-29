import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import QRCode from "react-qr-code";
import { qrDrawing, qrMatrix, qrModuleSource, qrPath } from "../scripts/qrCode";
import { LINKEDIN_QR } from "../src/data/linkedinQr";
import { cvData } from "../src/data/portfolioFacts";

/**
 * The printed CV's QR encodes a constant, so the drawing is committed as
 * data rather than produced by a generator shipped to every visitor. That
 * trade only holds while the committed drawing still matches the URL, which
 * is what these check.
 */

const MODULE_PATH = resolve(__dirname, "../src/data/linkedinQr.ts");

describe("the committed LinkedIn QR", () => {
  it("encodes the address the CV actually lists", () => {
    // The header renders cvData.header.linkedin as text beside the code. A
    // code pointing somewhere else would look correct on paper and take the
    // reader to the wrong profile.
    expect(LINKEDIN_QR.value).toBe(`https://${cvData.header.linkedin}`);
  });

  it("is the drawing that data produces", () => {
    // Regenerated here rather than trusted. If this fails, the file is
    // stale: the message carries the source it should hold.
    const regenerated = qrDrawing(`https://${cvData.header.linkedin}`);

    expect(LINKEDIN_QR).toEqual(regenerated);
    expect(readFileSync(MODULE_PATH, "utf8")).toBe(qrModuleSource(regenerated));
  });

  /**
   * The library this replaced drew the same code every visit at a cost of
   * roughly 49 kB of JavaScript. Dropping it is only safe if the drawing did
   * not change, so the two are compared module for module.
   */
  it("draws the same modules react-qr-code drew", () => {
    const markup = renderToStaticMarkup(
      React.createElement(QRCode, { value: LINKEDIN_QR.value }),
    );

    const viewBox = /viewBox="0 0 (\d+) \1"/.exec(markup);
    expect(viewBox).not.toBeNull();
    expect(Number(viewBox![1])).toBe(LINKEDIN_QR.size);

    // Two paths: the light modules first, then the dark ones. The dark path
    // is the one to compare against.
    const paths = [...markup.matchAll(/ d="([^"]*)"/g)].map((m) => m[1]);
    expect(paths).toHaveLength(2);

    // It draws one square per module: "M 12 7 l 1 0 0 1 -1 0 Z".
    const drawn = new Set(
      [...paths[1].matchAll(/M (\d+) (\d+) l 1 0 0 1 -1 0 Z/g)].map(
        (m) => `${m[1]},${m[2]}`,
      ),
    );

    const mine = new Set<string>();
    qrMatrix(LINKEDIN_QR.value).forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark) mine.add(`${x},${y}`);
      });
    });

    expect(drawn.size).toBeGreaterThan(0);
    expect([...mine].sort()).toEqual([...drawn].sort());
  });
});

describe("qrPath", () => {
  it("merges a run of dark modules into one rectangle", () => {
    expect(qrPath([[true, true, true]])).toBe("M0 0h3v1h-3z");
  });

  it("breaks a run at a light module", () => {
    expect(qrPath([[true, false, true]])).toBe("M0 0h1v1h-1zM2 0h1v1h-1z");
  });

  it("closes a run that reaches the end of its row", () => {
    // Nothing after the last column triggers the flush, so a run touching
    // the right edge is the one that gets dropped when this is wrong.
    expect(qrPath([[false, true, true]])).toBe("M1 0h2v1h-2z");
  });

  it("keeps rows apart", () => {
    expect(qrPath([[true], [true]])).toBe("M0 0h1v1h-1zM0 1h1v1h-1z");
  });

  it("draws nothing for an empty row", () => {
    expect(qrPath([[false, false]])).toBe("");
  });

  /**
   * The whole point of merging: the committed string is data in the
   * repository, and one rectangle per module makes it several times longer
   * for the same picture.
   */
  it("is shorter than drawing every module separately", () => {
    const matrix = qrMatrix(LINKEDIN_QR.value);
    const perModule = matrix
      .flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : "")))
      .join("");

    expect(qrPath(matrix).length).toBeLessThan(perModule.length * 0.75);
  });
});
