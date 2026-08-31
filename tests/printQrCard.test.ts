import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import viteConfig from "../vite.config";
import {
  CARD,
  QR_BOX,
  QUIET_ZONE,
  RING,
  moduleCentre,
  moduleSide,
  printQrCard,
} from "../scripts/printQrCard";
import { qrMatrix } from "../scripts/qrCode";
import { PRINT_URL } from "../src/lib/printRequest";

/**
 * The card served at /cv-qr-code.png, held to the address it claims to
 * encode.
 *
 * Nothing else can hold it. The image is drawn into `dist/` at build time
 * and never exists in `public/`, so the unused-asset ratchet — the check
 * that deleted the two files this one replaces — cannot see it at all: it
 * reads `public/`, and a file that is only ever generated is outside its
 * reach in both directions. Nothing imports it either, so neither
 * reachability ratchet sees it. It is the one shipped artifact in this
 * repository with no other guard, which is why this one reads it back
 * rather than checking that it was written.
 *
 * Read back, not asserted about: the test draws the card, decodes the PNG,
 * samples the centre of every module and rebuilds the matrix. A card that
 * encodes the wrong address, or draws the code at the wrong scale, or lays
 * something over it, fails here — none of which a byte count or a file
 * existing would report.
 */

/** The card the build ships, not one assembled here to resemble it. */
const card = () => PNG.sync.read(printQrCard());

/** The pixel at a point, as the three channels that decide light or dark. */
function pixelAt(png: PNG, x: number, y: number): [number, number, number] {
  const i = (png.width * Math.round(y) + Math.round(x)) << 2;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
}

const luminance = ([r, g, b]: [number, number, number]) =>
  0.2126 * r + 0.7152 * g + 0.0722 * b;

describe("the card served at /cv-qr-code.png", () => {
  it("is the size the platforms crop a shared link to", () => {
    // The literal, not CARD. Comparing the drawing to the constant that
    // produced it is a tautology, measured: changing the height to 620 left
    // every check in this file green. 1200x630 is Open Graph's recommended
    // size and belongs to the platforms rather than to this repository,
    // which is exactly why it is the thing worth writing down twice.
    const png = card();

    expect([png.width, png.height]).toEqual([1200, 630]);
    expect([CARD.width, CARD.height]).toEqual([1200, 630]);
  });

  it("still encodes the address it says it does", () => {
    // The claim in one line: what a phone reads off this image is the same
    // string useAutoPrint answers to. Both sides come from PRINT_URL, and
    // this is what proves the drawing did not lose it on the way.
    const png = card();
    const expected = qrMatrix(PRINT_URL);

    const read = expected.map((row, r) =>
      row.map((_, c) => {
        const { x, y } = moduleCentre(r, c, expected.length);
        return luminance(pixelAt(png, x, y)) < 128;
      }),
    );

    expect(read).toEqual(expected);
  });

  it("leaves the code the white margin a scanner needs", () => {
    // The CV's own drawing has none — CVTemplate fills exactly 29x29 and
    // the sheet supplies the margin by accident. On a dark card nothing
    // does, so the margin is drawn, and this is what says it is still there.
    const png = card();
    const modules = qrMatrix(PRINT_URL).length;
    const side = moduleSide(modules);

    for (const [dx, dy] of [
      [side / 2, side / 2],
      [QR_BOX.side - side / 2, side / 2],
      [side / 2, QR_BOX.side - side / 2],
      [QR_BOX.side - side / 2, QR_BOX.side - side / 2],
    ]) {
      expect(
        luminance(pixelAt(png, QR_BOX.x + dx, QR_BOX.y + dy)),
        "a corner of the quiet zone is not white",
      ).toBeGreaterThan(240);
    }

    expect(QUIET_ZONE).toBeGreaterThanOrEqual(4);
  });

  it("frames the code in the site's gradient", () => {
    // The one thing on the card that says whose site the code belongs to,
    // and the reason this design was chosen over the plain tile. Nothing
    // asserted it when the frame was added: taking RING to 0 left every
    // other check here green.
    //
    // Sampled inside the band rather than outside it, because the glow
    // spreads the same colours over the panel for another forty pixels and
    // a probe out there would pass on the glow alone.
    const png = card();
    const middle = QR_BOX.y + QR_BOX.side / 2;
    const left = pixelAt(png, QR_BOX.x - RING / 2, middle);
    const right = pixelAt(png, QR_BOX.x + QR_BOX.side + RING / 2, middle);

    for (const [side, pixel] of [["left", left], ["right", right]] as const) {
      const saturation = Math.max(...pixel) - Math.min(...pixel);
      expect(saturation, `the ${side} of the frame is not a colour`).toBeGreaterThan(60);
    }

    // And running the way the site's gradient runs, cyan into purple, so a
    // frame painted one flat colour is not the same as this one.
    expect(left[2] - left[0], "the left of the frame is not the cyan end").toBeGreaterThan(
      right[2] - right[0],
    );
  });

  it("keeps the text inside the card", () => {
    // Drawing text does not refuse to overflow: at a fixed 58px this name
    // ran off the right edge of the panel and the card rendered anyway.
    // The size is fitted to the column now, and this reads the strip the
    // name would spill into rather than trusting that it fitted.
    const png = card();
    const edge = CARD.width - 48;

    for (let x = edge - 40; x < edge; x += 1) {
      for (let y = 120; y < 510; y += 1) {
        expect(
          luminance(pixelAt(png, x, y)),
          `something is drawn at ${x},${y}, which is past the panel's padding`,
        ).toBeLessThan(60);
      }
    }
  });

  it("is drawn by a plugin the build still runs", async () => {
    // Everything above judges a card this test drew itself, which says
    // nothing about whether a deploy carries one: unhook the plugin and all
    // of it stays green while the address goes back to answering 404. The
    // config is read rather than the file, because no unit test builds.
    //
    // Called, not read as an object: the config is exported as a function,
    // and a check that reached for `.plugins` on it would have thrown on
    // undefined rather than reporting anything about the build.
    const resolved = await viteConfig({ command: "build", mode: "production" });
    const plugins = (resolved.plugins ?? [])
      .flat()
      .map((plugin) => (plugin as { name?: string } | null)?.name);

    expect(plugins).toContain("draw-print-qr-card");
    // The sibling that writes into the same directory, so a flattening that
    // quietly found nothing cannot pass the line above by accident.
    expect(plugins).toContain("stamp-sitemap");
  });

  it("draws a card and not a blank one", () => {
    // Guards every check above: they all read pixels, and a canvas nobody
    // drew on would satisfy the overflow check and fail nothing else if the
    // code sampling were ever loosened.
    const png = card();
    let light = 0;

    for (let i = 0; i < png.data.length; i += 4) {
      if (luminance([png.data[i], png.data[i + 1], png.data[i + 2]]) > 200) light += 1;
    }

    // The white tile alone is 450x450 of a 1200x630 card, which is a quarter.
    expect(light / (png.data.length / 4)).toBeGreaterThan(0.1);
  });
});
