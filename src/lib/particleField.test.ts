import { beforeEach, describe, expect, it, vi } from "vitest";
import { LINK_DISTANCE, MOUSE_DISTANCE, ParticleField } from "./particleField";
import { FakePath2D, RecordingContext, seededRandom } from "../test/canvasRecording";

/**
 * These are the tests the extraction was for. Every rule below lived inside
 * a closure in a useEffect and could only be reached by mounting the
 * component and inspecting pixels jsdom does not produce.
 */

beforeEach(() => {
  vi.stubGlobal("Path2D", FakePath2D);
});

function fieldOf(width: number, height: number, seed: number) {
  const ctx = new RecordingContext();
  const field = new ParticleField(ctx.asCanvasContext(), {
    random: seededRandom(seed),
  });
  field.resize(width, height);
  return { ctx, field };
}

interface PlacedParticle {
  /** Fraction of the width. */
  x: number;
  /** Fraction of the height. */
  y: number;
  /** Raw random value; velocity is read as (value - 0.5) * 0.5. */
  vx?: number;
  vy?: number;
}

/**
 * A field with every particle placed exactly. resize consumes five random
 * values per particle, in this order, so feeding it a fixed list puts each
 * one where the test needs it.
 */
function placedField(width: number, height: number, particles: PlacedParticle[]) {
  const ctx = new RecordingContext();
  const values = particles.flatMap((p) => [p.x, p.y, p.vx ?? 0.5, p.vy ?? 0.5, 0.5]);

  let i = 0;
  const field = new ParticleField(ctx.asCanvasContext(), {
    random: () => values[i++] ?? 0.5,
  });
  field.resize(width, height);

  // A miscounted viewport would silently place the particles somewhere else.
  expect(field.particleCount).toBe(particles.length);
  return { ctx, field };
}

/**
 * A field whose particles are spread out but hold still: positions come from
 * the seed, velocities are pinned to zero. Lets a test compare drawn links
 * against the positions they were drawn from.
 */
function stillField(width: number, height: number, seed: number) {
  const ctx = new RecordingContext();
  const source = seededRandom(seed);
  let call = 0;
  const random = () => {
    // resize consumes five values per particle: x, y, vx, vy, size. The
    // velocity pair maps to zero drift, since it is read as (r - 0.5) * 0.5.
    const slot = call++ % 5;
    return slot === 2 || slot === 3 ? 0.5 : source();
  };

  const field = new ParticleField(ctx.asCanvasContext(), { random });
  field.resize(width, height);
  return { ctx, field };
}

/** The endpoint pairs of every link drawn in the given colour, as index pairs. */
function drawnPairs(
  ctx: RecordingContext,
  colour: string,
  positions: [number, number][],
): Set<string> {
  const indexOf = new Map(positions.map(([x, y], i) => [`${x},${y}`, i]));
  const pairs = new Set<string>();

  for (const stroke of ctx.strokes) {
    if (!stroke.style.startsWith(`rgba(${colour}`)) continue;
    const { points } = stroke.path;

    for (let p = 0; p < points.length; p += 2) {
      const a = indexOf.get(`${points[p][0]},${points[p][1]}`);
      const b = indexOf.get(`${points[p + 1][0]},${points[p + 1][1]}`);
      if (a === undefined || b === undefined) continue;
      pairs.add(a < b ? `${a}-${b}` : `${b}-${a}`);
    }
  }

  return pairs;
}

/** The O(n^2) scan the spatial hash replaced, kept here as the reference. */
function pairsWithinDistance(
  positions: [number, number][],
  distance: number,
): Set<string> {
  const pairs = new Set<string>();

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i][0] - positions[j][0];
      const dy = positions[i][1] - positions[j][1];
      if (Math.sqrt(dx * dx + dy * dy) < distance) pairs.add(`${i}-${j}`);
    }
  }

  return pairs;
}

describe("linking through the spatial hash", () => {
  /**
   * The hash exists to avoid comparing every pair, and its entire claim is
   * that it still finds the same ones. A cell scan that skipped a neighbour,
   * or a clamp that folded edge particles into the wrong column, would drop
   * links that nothing else would report: the picture would simply have
   * fewer lines in it.
   */
  it.each([
    [900, 700, 1],
    [900, 700, 2],
    [1920, 1080, 3],
    // Narrower than one cell, so every particle clamps into column 0.
    [100, 800, 4],
    // Shorter than one cell, the same case on the other axis.
    [1400, 90, 5],
    // Two columns wide: every particle sits in an edge cell.
    [240, 2400, 6],
  ])("links exactly the pairs a full scan finds (%ix%i, seed %i)", (w, h, seed) => {
    const { ctx, field } = fieldOf(w, h, seed);
    field.drawFrame();

    // No pointer is set, so nothing moved the particles after they were drawn.
    const positions = field.positions();
    const linked = drawnPairs(ctx, "56, 189, 248", positions);
    const expected = pairsWithinDistance(positions, LINK_DISTANCE);

    // A run that links nothing would satisfy any subset check, so the
    // reference has to have found something first.
    expect(expected.size).toBeGreaterThan(0);
    expect([...linked].sort()).toEqual([...expected].sort());
  });

  /**
   * A particle can sit outside the viewport for one frame: the bounce flips
   * its velocity on the frame it crosses the wall, so the position it is
   * drawn at that frame is already past the edge. Its grid column is
   * therefore negative before it is clamped, and an unclamped index writes
   * nowhere in an Int32Array rather than throwing. The particle vanishes
   * from the grid, and every link to it silently stops being drawn.
   *
   * The order matters: links are drawn from the lower index to the higher
   * one, so this only shows up when the escaped particle is the higher of
   * the two.
   */
  it.each([
    // 250x100 is two particles across three columns. The second starts
    // against the left wall moving left at 0.2/frame.
    ["left", 250, 100, { x: 30 / 250, y: 0.5 }, { x: 0.0002, y: 0.5, vx: 0.1 }, 0],
    // The same case rotated: three rows, the second against the top wall.
    ["top", 100, 250, { x: 0.5, y: 30 / 250 }, { x: 0.5, y: 0.0002, vy: 0.1 }, 1],
  ] as const)(
    "keeps a particle that has just crossed the %s wall in the grid",
    (_wall, width, height, anchor, escaping, axis) => {
      const { ctx, field } = placedField(width, height, [anchor, escaping]);
      field.drawFrame();

      const positions = field.positions();
      expect(positions[1][axis]).toBeLessThan(0);

      expect([...drawnPairs(ctx, "56, 189, 248", positions)]).toEqual(["0-1"]);
    },
  );

  it("draws each linked pair once rather than once per direction", () => {
    const { ctx, field } = fieldOf(900, 700, 7);
    field.drawFrame();

    const segments = ctx.strokes
      .filter((s) => s.style.startsWith("rgba(56, 189, 248"))
      .reduce((total, s) => total + s.path.points.length / 2, 0);

    expect(segments).toBe(
      pairsWithinDistance(field.positions(), LINK_DISTANCE).size,
    );
  });

  it("spreads links across opacity buckets and strokes each bucket once", () => {
    const { ctx, field } = fieldOf(900, 700, 8);
    field.drawFrame();

    const styles = ctx.strokes
      .filter((s) => s.style.startsWith("rgba(56, 189, 248"))
      .map((s) => s.style);

    // Eight buckets, eight strokes, no repeats: the whole point of bucketing
    // is that a bucket is stroked once however many links it holds.
    expect(styles).toHaveLength(8);
    expect(new Set(styles).size).toBe(8);

    // Each bucket paints at its midpoint opacity, rising to just under the
    // 0.2 ceiling. Compared as numbers, since the exact decimal expansion of
    // the product is not the behaviour under test.
    const alphas = styles.map((s) => Number(/, ([\d.]+)\)$/.exec(s)![1]));
    expect(alphas[0]).toBeCloseTo(0.0125, 6);
    expect(alphas[7]).toBeCloseTo(0.1875, 6);
    expect([...alphas].sort((a, b) => a - b)).toEqual(alphas);
  });
});

describe("motion", () => {
  /** 200x60 is 12000 square pixels: exactly one particle. */
  const singleParticle = (particle: PlacedParticle) =>
    placedField(200, 60, [particle]).field;

  it("turns a particle around at the right-hand wall", () => {
    // x just short of the wall, moving right at 0.2/frame.
    const field = singleParticle({ x: 0.9999, y: 0.5, vx: 0.9 });

    field.drawFrame();
    const [[afterCrossing]] = field.positions();
    expect(afterCrossing).toBeGreaterThan(200);

    // The bounce flips the velocity on the frame the wall is crossed, so the
    // next frame brings it back rather than letting it drift away forever.
    field.drawFrame();
    expect(field.positions()[0][0]).toBeLessThan(afterCrossing);
  });

  it("turns a particle around at the top wall", () => {
    // y at 0, moving up at -0.2/frame.
    const field = singleParticle({ x: 0.5, y: 0, vy: 0.1 });

    field.drawFrame();
    const [[, afterCrossing]] = field.positions();
    expect(afterCrossing).toBeLessThan(0);

    field.drawFrame();
    expect(field.positions()[0][1]).toBeGreaterThan(afterCrossing);
  });

  it("pulls a particle towards the cursor once it is outside the dead zone", () => {
    // Still: velocity comes from (r - 0.5) * 0.5, so 0.5 means it does not drift.
    const field = singleParticle({ x: 0.5, y: 0.5 });
    const [[startX, startY]] = field.positions();

    // 60px to the left of the particle: inside the link radius, outside the
    // 50px dead zone.
    field.setPointer(startX - 60, startY);
    field.drawFrame();

    const [[pulledX, pulledY]] = field.positions();
    expect(pulledX).toBeLessThan(startX);
    expect(pulledY).toBeCloseTo(startY, 5);
  });

  it("leaves a particle alone inside the dead zone", () => {
    const field = singleParticle({ x: 0.5, y: 0.5 });
    const [[startX, startY]] = field.positions();

    field.setPointer(startX - 40, startY);
    field.drawFrame();

    expect(field.positions()[0]).toEqual([startX, startY]);
  });

  it("stops linking to the cursor once it is cleared", () => {
    const { ctx, field } = fieldOf(900, 700, 9);
    const cursorLinks = () =>
      ctx.strokes.filter((s) => s.style.startsWith("rgba(139, 92, 246")).length;

    field.setPointer(450, 350);
    field.drawFrame();
    expect(cursorLinks()).toBeGreaterThan(0);

    const withCursor = cursorLinks();
    field.clearPointer();
    field.drawFrame();
    expect(cursorLinks()).toBe(withCursor);
  });

  it("links to the cursor exactly the particles within reach of it", () => {
    // A still field, so the positions read before the frame are the ones the
    // links were drawn from. Otherwise the cursor's own pull moves the
    // endpoints and there is nothing left to compare against.
    const { ctx, field } = stillField(900, 700, 10);
    const before = field.positions();

    field.setPointer(450, 350);
    field.drawFrame();

    const endpoints = ctx.strokes
      .filter((s) => s.style.startsWith("rgba(139, 92, 246"))
      .flatMap((s) => s.path.points.filter(([x, y]) => x !== 450 || y !== 350));

    const reachable = before.filter(
      ([x, y]) => Math.hypot(x - 450, y - 350) < MOUSE_DISTANCE,
    );

    expect(reachable.length).toBeGreaterThan(0);
    expect(endpoints.length).toBe(reachable.length);
    for (const point of reachable) {
      expect(endpoints).toContainEqual(point);
    }
  });
});

describe("field size", () => {
  it("scales the particle count with the area", () => {
    expect(fieldOf(400, 300, 1).field.particleCount).toBe(10);
    expect(fieldOf(800, 600, 1).field.particleCount).toBe(40);
  });

  it("caps the count so a large monitor does not cost a large frame", () => {
    // 2560x1440 would otherwise ask for 307 particles, and linking cost grows
    // with the count.
    expect(fieldOf(2560, 1440, 1).field.particleCount).toBe(120);
  });

  it("keeps drawing after a resize rebuilds the field", () => {
    const { ctx, field } = fieldOf(900, 700, 11);
    field.drawFrame();

    field.resize(400, 300);
    expect(field.particleCount).toBe(10);

    const before = ctx.ops.length;
    field.drawFrame();
    expect(ctx.ops.slice(before)).toContain("clearRect(0,0,400,300)");
    expect(ctx.ops.slice(before).filter((op) => op === "fill")).toHaveLength(10);
  });

  it("survives a viewport too small to hold a single particle", () => {
    const { field } = fieldOf(50, 50, 12);
    expect(field.particleCount).toBe(0);
    expect(() => field.drawFrame()).not.toThrow();
  });
});
