/**
 * A canvas that records instead of painting. jsdom has no 2D context and no
 * Path2D, so anything drawn on a canvas is otherwise unobservable in a test.
 *
 * The recording is deliberately faithful rather than tidy: property changes
 * are logged in place alongside the calls, because a change that reorders
 * two state assignments has changed the drawing even when the pixels come
 * out the same.
 */

/** Rounded so a difference has to be visible before it shows up in the log. */
const round = (n: number) => Math.round(n * 10000) / 10000;

export class FakePath2D {
  readonly ops: string[] = [];
  /** Endpoints in the order they were added, for assertions about geometry. */
  readonly points: [number, number][] = [];

  moveTo(x: number, y: number) {
    this.ops.push(`M${round(x)},${round(y)}`);
    this.points.push([x, y]);
  }

  lineTo(x: number, y: number) {
    this.ops.push(`L${round(x)},${round(y)}`);
    this.points.push([x, y]);
  }
}

export interface StrokeRecord {
  style: string;
  lineWidth: number;
  path: FakePath2D;
}

export class RecordingContext {
  /** Every call and property change, in order. */
  readonly ops: string[] = [];
  /** Each stroke with the style it was drawn in and the path it drew. */
  readonly strokes: StrokeRecord[] = [];

  private currentPath = new FakePath2D();
  private fill_ = "";
  private stroke_ = "";
  private width_ = 0;

  get fillStyle() {
    return this.fill_;
  }
  set fillStyle(value: string) {
    this.fill_ = value;
    this.ops.push(`fillStyle=${value}`);
  }

  get strokeStyle() {
    return this.stroke_;
  }
  set strokeStyle(value: string) {
    this.stroke_ = value;
    this.ops.push(`strokeStyle=${value}`);
  }

  get lineWidth() {
    return this.width_;
  }
  set lineWidth(value: number) {
    this.width_ = value;
    this.ops.push(`lineWidth=${value}`);
  }

  setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
    this.ops.push(`setTransform(${a},${b},${c},${d},${e},${f})`);
  }

  clearRect(x: number, y: number, w: number, h: number) {
    this.ops.push(`clearRect(${round(x)},${round(y)},${round(w)},${round(h)})`);
  }

  beginPath() {
    this.currentPath = new FakePath2D();
    this.ops.push("beginPath");
  }

  arc(x: number, y: number, radius: number, start: number, end: number) {
    this.ops.push(
      `arc(${round(x)},${round(y)},${round(radius)},${round(start)},${round(end)})`,
    );
  }

  fill() {
    this.ops.push("fill");
  }

  stroke(path?: FakePath2D) {
    const drawn = path ?? this.currentPath;
    this.strokes.push({
      style: this.stroke_,
      lineWidth: this.width_,
      path: drawn,
    });
    this.ops.push(`stroke[${drawn.ops.join(" ")}]`);
  }

  /** The context type is structural here; the real one is far wider. */
  asCanvasContext(): CanvasRenderingContext2D {
    return this as unknown as CanvasRenderingContext2D;
  }
}

/**
 * mulberry32. Particle positions come from a random source, so without a
 * fixed sequence there is no output to pin.
 */
export function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
