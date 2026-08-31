import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import { cvData } from "../src/data/portfolioFacts.ts";
import { PRINT_URL } from "../src/lib/printRequest.ts";
import { qrMatrix } from "./qrCode.ts";

/**
 * The card served at /cv-qr-code.png.
 *
 * Two files used to sit in public/ under that name, a PNG and an SVG, drawn
 * for a QR the print template had stopped rendering. Nothing pointed at
 * them and they shipped on every deploy, so the unused-asset ratchet took
 * them out — and the address kept being scanned and shared, because an
 * address on somebody else's material does not go away when the file does.
 *
 * So it comes back, as a picture worth landing on rather than a bare code,
 * and it is drawn here at build time rather than committed. A generated
 * artifact checked into the repository is free to drift from the thing it
 * was generated from: this one cannot, because the address it shows and the
 * code it draws are the same constant, read once, at the moment the image
 * is made.
 *
 * A picture and not a page, deliberately. GitHub Pages answers an unknown
 * path with 404.html and the status stays 404 whatever the app renders, so
 * a real view at this address would be a real document served under a code
 * that says it does not exist — invisible to search, refused by the link
 * previews that are most of the point, and untrue. A file is 200 and
 * image/png, which is what every place this address gets pasted expects.
 */

/**
 * The name it is served under.
 *
 * Not a new address chosen for tidiness: this is the one already printed,
 * pasted and linked, and the whole reason the card exists. Kept here so the
 * build and the check that reads the build back cannot disagree about it.
 */
export const PRINT_QR_CARD_FILE = "cv-qr-code.png";

/** The line above the name, saying what the code is for. */
export const PRINT_QR_CARD_LEAD = "Scan to open the CV";

/** The proportions the platforms crop a shared link to. */
export const CARD = { width: 1200, height: 630 };

/**
 * Modules of white around the code, which the specification asks for and
 * the CV's own drawing does not have: `CVTemplate` fills exactly 29x29, and
 * on paper the sheet supplies the margin by accident. Nothing supplies it
 * on a dark card, and a code run to the edge is the one a phone gives up on.
 */
export const QUIET_ZONE = 4;

/** The site's palette, the values `src/index.css` and the components use. */
const INK = {
  ground: "#020617",
  panel: "#0f172a",
  line: "#1e293b",
  white: "#ffffff",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  cyan: "#22d3ee",
  cyan600: "#06b6d4",
  purple: "#a855f7",
};

export interface CardText {
  /** Who the CV belongs to. */
  name: string;
  /** What they do. */
  title: string;
  /** The line above the name, saying what the code is for. */
  lead: string;
}

/**
 * Where the code sits on the card, in device pixels.
 *
 * Exported because the check that this image still encodes the right
 * address has to find the modules to read them, and a second copy of these
 * numbers in the test would be a second thing to keep in step.
 */
export const QR_BOX = { x: 88, y: 90, side: 450 };

/**
 * The gradient frame around the tile, in device pixels.
 *
 * Outside the tile and therefore outside the quiet zone, which is what
 * makes it safe: the scanner reads contrast between the code and the white
 * around it, and nothing coloured comes near that. The card is small
 * wherever it actually gets used — 345px across in a LinkedIn featured
 * tile, measured — so this is the only thing on it that says whose site the
 * code belongs to at a glance.
 */
export const RING = 7;

/** Where the text column starts and how much room it has. */
const TEXT = {
  left: QR_BOX.x + QR_BOX.side + RING + 52,
  right: CARD.width - 48 - 48,
};

/** Side of one module, including the white margin the code is drawn into. */
export function moduleSide(modules: number): number {
  return QR_BOX.side / (modules + QUIET_ZONE * 2);
}

/** The centre of one module, in device pixels, for sampling it back. */
export function moduleCentre(
  row: number,
  column: number,
  modules: number,
): { x: number; y: number } {
  const side = moduleSide(modules);
  return {
    x: QR_BOX.x + (QUIET_ZONE + column) * side + side / 2,
    y: QR_BOX.y + (QUIET_ZONE + row) * side + side / 2,
  };
}

/** Draws the code as filled squares, module by module, with its margin. */
function drawCode(context: SKRSContext2D, value: string): void {
  const matrix = qrMatrix(value);
  const side = moduleSide(matrix.length);

  // The frame first, and the glow with it, so the tile is laid over both
  // and nothing coloured survives inside the quiet zone.
  context.save();
  context.shadowColor = "rgba(34, 211, 238, 0.45)";
  context.shadowBlur = 44;
  const ring = context.createLinearGradient(
    QR_BOX.x - RING,
    QR_BOX.y - RING,
    QR_BOX.x + QR_BOX.side + RING,
    QR_BOX.y + QR_BOX.side + RING,
  );
  ring.addColorStop(0, INK.cyan600);
  ring.addColorStop(1, INK.purple);
  context.fillStyle = ring;
  roundedRect(
    context,
    QR_BOX.x - RING,
    QR_BOX.y - RING,
    QR_BOX.side + RING * 2,
    QR_BOX.side + RING * 2,
    22,
  );
  context.fill();
  context.restore();

  context.fillStyle = INK.white;
  roundedRect(context, QR_BOX.x, QR_BOX.y, QR_BOX.side, QR_BOX.side, 14);
  context.fill();

  context.fillStyle = "#000000";
  matrix.forEach((cells, row) => {
    cells.forEach((dark, column) => {
      if (!dark) return;
      // Ceil rather than round: a module drawn a fraction short leaves a
      // pale seam between neighbours, and a scanner reads the seam.
      context.fillRect(
        QR_BOX.x + (QUIET_ZONE + column) * side,
        QR_BOX.y + (QUIET_ZONE + row) * side,
        Math.ceil(side),
        Math.ceil(side),
      );
    });
  });
}

/** The rounded rectangle the panel and the code tile are both drawn in. */
function roundedRect(
  context: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

/**
 * Draws the card and returns it as PNG bytes.
 *
 * The gradient is the site's own, spent on the seam along the top edge and
 * on a hairline under the name — never inside the code's white margin,
 * where it would cost the scanner the contrast the code is made of.
 */
export function drawPrintQrCard(url: string, text: CardText): Buffer {
  const canvas = createCanvas(CARD.width, CARD.height);
  const context = canvas.getContext("2d");

  context.fillStyle = INK.ground;
  context.fillRect(0, 0, CARD.width, CARD.height);

  // The panel the dialogs wear, turned landscape.
  const panel = { x: 48, y: 48, width: CARD.width - 96, height: CARD.height - 96 };
  context.fillStyle = INK.panel;
  roundedRect(context, panel.x, panel.y, panel.width, panel.height, 28);
  context.fill();
  context.strokeStyle = INK.line;
  context.lineWidth = 2;
  context.stroke();

  // The seam. Clipped to the panel so it follows the rounded corners.
  context.save();
  roundedRect(context, panel.x, panel.y, panel.width, panel.height, 28);
  context.clip();
  const seam = context.createLinearGradient(panel.x, 0, panel.x + panel.width, 0);
  seam.addColorStop(0, INK.cyan600);
  seam.addColorStop(1, INK.purple);
  context.fillStyle = seam;
  context.fillRect(panel.x, panel.y, panel.width, 6);
  context.restore();

  drawCode(context, url);

  const { left, right } = TEXT;
  const room = right - left;
  const nameSize = fittingSize(context, text.name, "bold", "sans-serif", 56, room);

  context.textBaseline = "alphabetic";

  // The stack is measured, then centred on the code rather than placed at
  // numbers that happen to look right: the name is the tallest line and its
  // size is decided above, so anything below it that was positioned by hand
  // would move the moment a longer name shrank it.
  const rows = [28, nameSize, 34, 4];
  const gaps = [32, 24, 34];
  const height = rows.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0);
  let y = QR_BOX.y + QR_BOX.side / 2 - height / 2;

  context.fillStyle = INK.cyan;
  context.font = "500 28px monospace";
  y += rows[0];
  context.fillText(text.lead, left, y);

  context.fillStyle = INK.white;
  context.font = `bold ${nameSize}px sans-serif`;
  y += gaps[0] + rows[1];
  context.fillText(text.name, left, y);

  context.fillStyle = INK.slate400;
  context.font = "400 34px sans-serif";
  y += gaps[1] + rows[2];
  context.fillText(text.title, left, y);

  // No address line. LinkedIn prints the URL under the card itself, so a
  // second copy inside the picture was the smallest type on the smallest
  // thing on the page, saying what the page already said.
  y += gaps[2];
  const rule = context.createLinearGradient(left, 0, left + 240, 0);
  rule.addColorStop(0, INK.cyan);
  rule.addColorStop(1, INK.purple);
  context.fillStyle = rule;
  context.fillRect(left, y, 240, rows[3]);

  return canvas.toBuffer("image/png");
}

/**
 * The card the build ships, arguments and all.
 *
 * One function rather than a call the plugin assembles, because the check
 * on this image reads a card it drew itself: given the plugin its own
 * arguments, it would prove that drawing a code for some address encodes
 * that address, and say nothing about the address the deploy carries. The
 * build and the check call this, so there is one place the answer is
 * decided and the check is reading it.
 */
export function printQrCard(): Buffer {
  return drawPrintQrCard(PRINT_URL, {
    name: cvData.header.name,
    title: cvData.header.title,
    lead: PRINT_QR_CARD_LEAD,
  });
}

/**
 * The largest size at which a line still fits the column.
 *
 * A fixed size is a number that holds until the text changes: at 58px the
 * name this card carries ran off the right edge of the panel, and the card
 * still rendered, because nothing about drawing text refuses to overflow.
 * The face is fontconfig's choice and its metrics are not this repository's
 * to pin, so the size is measured against the room rather than chosen for
 * one machine's idea of what sans-serif is.
 */
function fittingSize(
  context: SKRSContext2D,
  line: string,
  weight: string,
  family: string,
  largest: number,
  room: number,
): number {
  for (let size = largest; size > 20; size -= 1) {
    context.font = `${weight} ${size}px ${family}`;
    if (context.measureText(line).width <= room) return size;
  }

  return 20;
}
