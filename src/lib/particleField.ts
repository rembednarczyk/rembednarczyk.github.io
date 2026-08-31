/** Maximum distance at which two particles are linked. */
export const LINK_DISTANCE = 120;
/** Maximum distance at which a particle is linked to the cursor. */
export const MOUSE_DISTANCE = 180;
/**
 * Link opacities are rounded into this many buckets so each bucket can be
 * drawn as a single path instead of one stroke per pair.
 */
const ALPHA_BUCKETS = 8;

/** One particle per this many square pixels, up to the cap. */
const AREA_PER_PARTICLE = 12000;
/** Ceiling on the field size, so a large monitor does not cost a large frame. */
const MAX_PARTICLES = 120;

/** Below this distance the cursor stops pulling, so particles do not collapse onto it. */
const ATTRACTION_DEAD_ZONE = 50;
const ATTRACTION_STRENGTH = 0.005;

const PARTICLE_FILL = "rgba(139, 92, 246, 0.8)";
const LINK_COLOR = "56, 189, 248";
const CURSOR_LINK_COLOR = "139, 92, 246";

const LINK_MAX_ALPHA = 0.2;
const LINK_FALLOFF = 600;
const CURSOR_MAX_ALPHA = 0.6;
const CURSOR_FALLOFF = 300;

/** Placed far enough outside any viewport that no particle can reach it. */
const POINTER_ABSENT = -1000;

export interface ParticleFieldOptions {
  /** Injectable so a test can pin the layout; defaults to Math.random. */
  random?: () => number;
}

/**
 * The particle simulation and its drawing, with no knowledge of React, the
 * window, or the canvas element. It is handed a 2D context and a size, and
 * paints one frame when asked.
 *
 * This used to be eleven nested functions closed over eleven mutable
 * bindings inside a single useEffect, which made every part of it reachable
 * only by mounting the component and watching pixels that jsdom does not
 * produce. The spatial hash in particular is an optimisation whose whole
 * claim is that it links the same pairs as the O(n^2) scan it replaced, and
 * nothing could check that claim.
 */
export class ParticleField {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly random: () => number;

  /**
   * Particle state in flat arrays: one allocation for the whole field
   * instead of an object with two closures per particle.
   */
  private count = 0;
  private xs = new Float32Array(0);
  private ys = new Float32Array(0);
  private vxs = new Float32Array(0);
  private vys = new Float32Array(0);
  private sizes = new Float32Array(0);

  /** CSS pixels. The backing store is larger on high-DPI screens. */
  private viewWidth = 0;
  private viewHeight = 0;

  private pointerX = POINTER_ABSENT;
  private pointerY = POINTER_ABSENT;

  /**
   * Spatial hash, rebuilt each frame. Linking only ever looks at the cell a
   * particle sits in plus its neighbours, so the number of distance checks
   * grows with the particle count rather than its square.
   */
  private readonly cellSize = LINK_DISTANCE;
  private columns = 0;
  private rows = 0;
  private cellStart = new Int32Array(0);
  private cellCount = new Int32Array(0);
  private cellItems = new Int32Array(0);

  /** Reused across frames; the contents are replaced, not appended to. */
  private readonly linkBuckets: Path2D[] = [];

  constructor(ctx: CanvasRenderingContext2D, options: ParticleFieldOptions = {}) {
    this.ctx = ctx;
    this.random = options.random ?? Math.random;
  }

  /** How many particles the current size produced. */
  get particleCount(): number {
    return this.count;
  }

  /** Positions in CSS pixels, for assertions. Copied, so callers cannot write back. */
  positions(): [number, number][] {
    const out: [number, number][] = [];
    for (let i = 0; i < this.count; i++) out.push([this.xs[i], this.ys[i]]);
    return out;
  }

  /** Reallocates the field for a new size. Existing particles are discarded. */
  resize(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;

    this.count = Math.min(
      Math.floor((width * height) / AREA_PER_PARTICLE),
      MAX_PARTICLES,
    );

    this.xs = new Float32Array(this.count);
    this.ys = new Float32Array(this.count);
    this.vxs = new Float32Array(this.count);
    this.vys = new Float32Array(this.count);
    this.sizes = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      this.xs[i] = this.random() * width;
      this.ys[i] = this.random() * height;
      this.vxs[i] = (this.random() - 0.5) * 0.5;
      this.vys[i] = (this.random() - 0.5) * 0.5;
      this.sizes[i] = this.random() * 2 + 0.5;
    }

    this.columns = Math.max(1, Math.ceil(width / this.cellSize));
    this.rows = Math.max(1, Math.ceil(height / this.cellSize));
    this.cellStart = new Int32Array(this.columns * this.rows + 1);
    this.cellCount = new Int32Array(this.columns * this.rows);
    this.cellItems = new Int32Array(this.count);
  }

  setPointer(x: number, y: number): void {
    this.pointerX = x;
    this.pointerY = y;
  }

  clearPointer(): void {
    this.pointerX = POINTER_ABSENT;
    this.pointerY = POINTER_ABSENT;
  }

  /** Advances the simulation by one step and paints it. */
  drawFrame(): void {
    this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
    this.step();
    this.buildGrid();
    this.drawParticles();
    this.drawLinks();
    this.drawCursorLinks();
  }

  private step(): void {
    for (let i = 0; i < this.count; i++) {
      this.xs[i] += this.vxs[i];
      this.ys[i] += this.vys[i];
      if (this.xs[i] < 0 || this.xs[i] > this.viewWidth) this.vxs[i] = -this.vxs[i];
      if (this.ys[i] < 0 || this.ys[i] > this.viewHeight) this.vys[i] = -this.vys[i];
    }
  }

  private columnOf(x: number): number {
    return Math.min(Math.max(Math.floor(x / this.cellSize), 0), this.columns - 1);
  }

  private rowOf(y: number): number {
    return Math.min(Math.max(Math.floor(y / this.cellSize), 0), this.rows - 1);
  }

  private cellIndexOf(i: number): number {
    return this.rowOf(this.ys[i]) * this.columns + this.columnOf(this.xs[i]);
  }

  /** Counting sort of particle indices into their grid cells. */
  private buildGrid(): void {
    this.cellCount.fill(0);
    for (let i = 0; i < this.count; i++) this.cellCount[this.cellIndexOf(i)]++;

    let running = 0;
    for (let c = 0; c < this.cellCount.length; c++) {
      this.cellStart[c] = running;
      running += this.cellCount[c];
    }
    this.cellStart[this.cellCount.length] = running;

    const cursor = this.cellStart.slice(0, this.cellCount.length);
    for (let i = 0; i < this.count; i++) {
      this.cellItems[cursor[this.cellIndexOf(i)]++] = i;
    }
  }

  private drawParticles(): void {
    this.ctx.fillStyle = PARTICLE_FILL;
    for (let i = 0; i < this.count; i++) {
      this.ctx.beginPath();
      this.ctx.arc(this.xs[i], this.ys[i], this.sizes[i], 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /** Rounds an opacity into its bucket, keeping the top value inside range. */
  private static bucketOf(alpha: number, maxAlpha: number): number {
    const bucket = Math.floor((alpha / maxAlpha) * ALPHA_BUCKETS);
    return bucket >= ALPHA_BUCKETS ? ALPHA_BUCKETS - 1 : bucket;
  }

  /** The opacity every link in a bucket is drawn at. */
  private static bucketAlpha(bucket: number, maxAlpha: number): number {
    return ((bucket + 0.5) / ALPHA_BUCKETS) * maxAlpha;
  }

  private drawLinks(): void {
    for (let b = 0; b < ALPHA_BUCKETS; b++) this.linkBuckets[b] = new Path2D();

    const linkDistSq = LINK_DISTANCE * LINK_DISTANCE;

    for (let i = 0; i < this.count; i++) {
      const cx = this.columnOf(this.xs[i]);
      const cy = this.rowOf(this.ys[i]);

      for (let oy = -1; oy <= 1; oy++) {
        const ny = cy + oy;
        if (ny < 0 || ny >= this.rows) continue;

        for (let ox = -1; ox <= 1; ox++) {
          const nx = cx + ox;
          if (nx < 0 || nx >= this.columns) continue;

          const cell = ny * this.columns + nx;
          const end = this.cellStart[cell] + this.cellCount[cell];

          for (let s = this.cellStart[cell]; s < end; s++) {
            const j = this.cellItems[s];
            // Each pair is considered once.
            if (j <= i) continue;

            const dx = this.xs[i] - this.xs[j];
            const dy = this.ys[i] - this.ys[j];
            const distSq = dx * dx + dy * dy;
            if (distSq >= linkDistSq) continue;

            const distance = Math.sqrt(distSq);
            const alpha = LINK_MAX_ALPHA - distance / LINK_FALLOFF;
            if (alpha <= 0) continue;

            const path = this.linkBuckets[ParticleField.bucketOf(alpha, LINK_MAX_ALPHA)];
            path.moveTo(this.xs[i], this.ys[i]);
            path.lineTo(this.xs[j], this.ys[j]);
          }
        }
      }
    }

    this.ctx.lineWidth = 0.5;
    for (let b = 0; b < ALPHA_BUCKETS; b++) {
      this.ctx.strokeStyle = `rgba(${LINK_COLOR}, ${ParticleField.bucketAlpha(b, LINK_MAX_ALPHA)})`;
      this.ctx.stroke(this.linkBuckets[b]);
    }
  }

  /**
   * Draws the cursor links and applies the cursor's pull in the same pass.
   * They are fused on purpose: a link is drawn from where the particle was
   * when the frame started, and pulling first would move the endpoint.
   */
  private drawCursorLinks(): void {
    // A cursor outside the viewport is absent. That also covers a real
    // pointer at a negative clientX, which cannot link to anything on screen.
    if (this.pointerX < 0) return;

    const mouseDistSq = MOUSE_DISTANCE * MOUSE_DISTANCE;
    const paths: Path2D[] = [];
    for (let b = 0; b < ALPHA_BUCKETS; b++) paths[b] = new Path2D();
    let drew = false;

    for (let i = 0; i < this.count; i++) {
      const dx = this.xs[i] - this.pointerX;
      const dy = this.ys[i] - this.pointerY;
      const distSq = dx * dx + dy * dy;
      if (distSq >= mouseDistSq) continue;

      const distance = Math.sqrt(distSq);
      // Brightest right under the cursor.
      const alpha = CURSOR_MAX_ALPHA - distance / CURSOR_FALLOFF;
      if (alpha > 0) {
        const bucket = ParticleField.bucketOf(alpha, CURSOR_MAX_ALPHA);
        paths[bucket].moveTo(this.xs[i], this.ys[i]);
        paths[bucket].lineTo(this.pointerX, this.pointerY);
        drew = true;
      }

      if (distance > ATTRACTION_DEAD_ZONE) {
        this.xs[i] -= dx * ATTRACTION_STRENGTH;
        this.ys[i] -= dy * ATTRACTION_STRENGTH;
      }
    }

    if (!drew) return;
    this.ctx.lineWidth = 1;
    for (let b = 0; b < ALPHA_BUCKETS; b++) {
      this.ctx.strokeStyle = `rgba(${CURSOR_LINK_COLOR}, ${ParticleField.bucketAlpha(b, CURSOR_MAX_ALPHA)})`;
      this.ctx.stroke(paths[b]);
    }
  }
}
