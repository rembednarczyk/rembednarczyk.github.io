import qrcode from "qrcode-generator";

/**
 * Draws a QR code as a single SVG path.
 *
 * The site's only QR encodes a constant, so there is no reason to ship a
 * generator to the browser to redraw it on every visit. This runs in a test
 * instead, and the drawing it produces is committed as data.
 */

/**
 * Error correction level. "L" is what react-qr-code defaulted to, and the
 * equivalence test compares against that library, so changing this changes
 * what is being compared.
 */
const ERROR_CORRECTION = "L";

/** Rows of modules, true where the module is dark. */
export function qrMatrix(value: string): boolean[][] {
  // 0 lets the library pick the smallest version that fits.
  const qr = qrcode(0, ERROR_CORRECTION);
  qr.addData(value);
  qr.make();

  const size = qr.getModuleCount();
  const rows: boolean[][] = [];

  for (let row = 0; row < size; row++) {
    const cells: boolean[] = [];
    for (let column = 0; column < size; column++) {
      cells.push(qr.isDark(row, column));
    }
    rows.push(cells);
  }

  return rows;
}

/**
 * One path covering every dark module, in a coordinate system of one unit
 * per module. Runs of adjacent dark modules in a row become a single
 * rectangle, which is what keeps the committed string small: the same code
 * drawn one module at a time is roughly ten times longer.
 */
export function qrPath(matrix: boolean[][]): string {
  const parts: string[] = [];

  matrix.forEach((cells, row) => {
    let start: number | null = null;

    const flush = (end: number) => {
      if (start === null) return;
      const width = end - start;
      parts.push(`M${start} ${row}h${width}v1h-${width}z`);
      start = null;
    };

    cells.forEach((dark, column) => {
      if (dark && start === null) start = column;
      if (!dark) flush(column);
    });

    flush(cells.length);
  });

  return parts.join("");
}

export interface QrDrawing {
  /** The string the code encodes. */
  value: string;
  /** Modules per side, which is also the viewBox extent. */
  size: number;
  /** Path data covering the dark modules. */
  path: string;
}

export function qrDrawing(value: string): QrDrawing {
  const matrix = qrMatrix(value);
  return { value, size: matrix.length, path: qrPath(matrix) };
}

/** The contents of src/data/linkedinQr.ts, so the test can regenerate it. */
export function qrModuleSource(drawing: QrDrawing): string {
  return `import { QrDrawing } from "../../scripts/qrCode";

/**
 * Generated. Do not edit by hand.
 *
 * The printed CV carries a QR to the LinkedIn profile. The code is a
 * constant, so it is drawn once here rather than by a generator running in
 * every visitor's browser.
 *
 * tests/linkedinQr.test.ts redraws it from cvData and fails if the two
 * disagree, so the URL cannot change without this changing with it. To
 * regenerate, run that test and take the value it reports.
 */
export const LINKEDIN_QR: QrDrawing = {
  value: ${JSON.stringify(drawing.value)},
  size: ${drawing.size},
  path: ${JSON.stringify(drawing.path)},
};
`;
}
