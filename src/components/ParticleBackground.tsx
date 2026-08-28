import React, { useEffect, useRef, useState } from "react";

/** Maximum distance at which two particles are linked. */
const LINK_DISTANCE = 120;
/** Maximum distance at which a particle is linked to the cursor. */
const MOUSE_DISTANCE = 180;
/** Link opacities are rounded into this many buckets so each bucket can be
 *  drawn as a single path instead of one stroke per pair. */
const ALPHA_BUCKETS = 8;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotionNow(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

const BACKDROP =
  "radial-gradient(circle at center, #0f172a 0%, #020617 100%)";

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    prefersReducedMotionNow,
  );

  // The setting can change while the page is open, so follow it rather
  // than sampling it once during the first render.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    // Particle state in flat arrays: one allocation for the whole field
    // instead of an object with two closures per particle.
    let count = 0;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let vxs = new Float32Array(0);
    let vys = new Float32Array(0);
    let sizes = new Float32Array(0);

    // CSS pixels. The backing store is larger on high-DPI screens.
    let viewWidth = 0;
    let viewHeight = 0;

    const mouse = { x: -1000, y: -1000 };

    // Spatial hash, rebuilt each frame. Linking only ever looks at the
    // cell a particle sits in plus its neighbours, so the number of
    // distance checks grows with the particle count rather than its square.
    const cellSize = LINK_DISTANCE;
    let columns = 0;
    let rows = 0;
    let cellStart = new Int32Array(0);
    let cellCount = new Int32Array(0);
    let cellItems = new Int32Array(0);

    const initParticles = () => {
      count = Math.min(
        Math.floor((viewWidth * viewHeight) / 12000),
        120,
      );

      xs = new Float32Array(count);
      ys = new Float32Array(count);
      vxs = new Float32Array(count);
      vys = new Float32Array(count);
      sizes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        xs[i] = Math.random() * viewWidth;
        ys[i] = Math.random() * viewHeight;
        vxs[i] = (Math.random() - 0.5) * 0.5;
        vys[i] = (Math.random() - 0.5) * 0.5;
        sizes[i] = Math.random() * 2 + 0.5;
      }

      columns = Math.max(1, Math.ceil(viewWidth / cellSize));
      rows = Math.max(1, Math.ceil(viewHeight / cellSize));
      cellStart = new Int32Array(columns * rows + 1);
      cellCount = new Int32Array(columns * rows);
      cellItems = new Int32Array(count);
    };

    const resize = () => {
      // Cap the ratio: beyond 2x the extra pixels cost more than they show.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewWidth = window.innerWidth;
      viewHeight = window.innerHeight;

      canvas.width = Math.floor(viewWidth * dpr);
      canvas.height = Math.floor(viewHeight * dpr);
      canvas.style.width = `${viewWidth}px`;
      canvas.style.height = `${viewHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    const cellIndexOf = (i: number) => {
      let cx = Math.floor(xs[i] / cellSize);
      let cy = Math.floor(ys[i] / cellSize);
      if (cx < 0) cx = 0;
      else if (cx >= columns) cx = columns - 1;
      if (cy < 0) cy = 0;
      else if (cy >= rows) cy = rows - 1;
      return cy * columns + cx;
    };

    /** Counting sort of particle indices into their grid cells. */
    const buildGrid = () => {
      cellCount.fill(0);
      for (let i = 0; i < count; i++) cellCount[cellIndexOf(i)]++;

      let running = 0;
      for (let c = 0; c < cellCount.length; c++) {
        cellStart[c] = running;
        running += cellCount[c];
      }
      cellStart[cellCount.length] = running;

      const cursor = cellStart.slice(0, cellCount.length);
      for (let i = 0; i < count; i++) cellItems[cursor[cellIndexOf(i)]++] = i;
    };

    const update = () => {
      for (let i = 0; i < count; i++) {
        xs[i] += vxs[i];
        ys[i] += vys[i];
        if (xs[i] < 0 || xs[i] > viewWidth) vxs[i] = -vxs[i];
        if (ys[i] < 0 || ys[i] > viewHeight) vys[i] = -vys[i];
      }
    };

    const drawParticles = () => {
      ctx.fillStyle = "rgba(139, 92, 246, 0.8)";
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.arc(xs[i], ys[i], sizes[i], 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // One path per opacity bucket: a few strokes per frame rather than
    // one per linked pair.
    const buckets: Path2D[] = [];

    const drawLinks = () => {
      for (let b = 0; b < ALPHA_BUCKETS; b++) buckets[b] = new Path2D();

      const linkDistSq = LINK_DISTANCE * LINK_DISTANCE;

      for (let i = 0; i < count; i++) {
        const cx = Math.min(Math.max(Math.floor(xs[i] / cellSize), 0), columns - 1);
        const cy = Math.min(Math.max(Math.floor(ys[i] / cellSize), 0), rows - 1);

        for (let oy = -1; oy <= 1; oy++) {
          const ny = cy + oy;
          if (ny < 0 || ny >= rows) continue;

          for (let ox = -1; ox <= 1; ox++) {
            const nx = cx + ox;
            if (nx < 0 || nx >= columns) continue;

            const cell = ny * columns + nx;
            const end = cellStart[cell] + cellCount[cell];

            for (let s = cellStart[cell]; s < end; s++) {
              const j = cellItems[s];
              // Each pair is considered once.
              if (j <= i) continue;

              const dx = xs[i] - xs[j];
              const dy = ys[i] - ys[j];
              const distSq = dx * dx + dy * dy;
              if (distSq >= linkDistSq) continue;

              const distance = Math.sqrt(distSq);
              const alpha = 0.2 - distance / 600;
              if (alpha <= 0) continue;

              let bucket = Math.floor((alpha / 0.2) * ALPHA_BUCKETS);
              if (bucket >= ALPHA_BUCKETS) bucket = ALPHA_BUCKETS - 1;

              const path = buckets[bucket];
              path.moveTo(xs[i], ys[i]);
              path.lineTo(xs[j], ys[j]);
            }
          }
        }
      }

      ctx.lineWidth = 0.5;
      for (let b = 0; b < ALPHA_BUCKETS; b++) {
        const alpha = ((b + 0.5) / ALPHA_BUCKETS) * 0.2;
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.stroke(buckets[b]);
      }
    };

    const drawMouseLinks = () => {
      if (mouse.x < 0) return;

      const mouseDistSq = MOUSE_DISTANCE * MOUSE_DISTANCE;
      const paths: Path2D[] = [];
      for (let b = 0; b < ALPHA_BUCKETS; b++) paths[b] = new Path2D();
      let drew = false;

      for (let i = 0; i < count; i++) {
        const dx = xs[i] - mouse.x;
        const dy = ys[i] - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq >= mouseDistSq) continue;

        const distance = Math.sqrt(distSq);
        // Same falloff as before: brightest right under the cursor.
        const alpha = 0.6 - distance / 300;
        if (alpha > 0) {
          let bucket = Math.floor((alpha / 0.6) * ALPHA_BUCKETS);
          if (bucket >= ALPHA_BUCKETS) bucket = ALPHA_BUCKETS - 1;
          paths[bucket].moveTo(xs[i], ys[i]);
          paths[bucket].lineTo(mouse.x, mouse.y);
          drew = true;
        }

        // Slight attraction to the cursor.
        if (distance > 50) {
          xs[i] -= dx * 0.005;
          ys[i] -= dy * 0.005;
        }
      }

      if (!drew) return;
      ctx.lineWidth = 1;
      for (let b = 0; b < ALPHA_BUCKETS; b++) {
        const alpha = ((b + 0.5) / ALPHA_BUCKETS) * 0.6;
        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.stroke(paths[b]);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, viewWidth, viewHeight);
      update();
      buildGrid();
      drawParticles();
      drawLinks();
      drawMouseLinks();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Resizing reallocates the whole field, so coalesce the burst of
    // events a window drag produces.
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });

    resize();
    animate();

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: BACKDROP }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: BACKDROP }}
    />
  );
};
