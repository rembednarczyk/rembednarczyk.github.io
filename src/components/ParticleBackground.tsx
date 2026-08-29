import React, { useEffect, useRef, useState } from "react";
import { ParticleField } from "../lib/particleField";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Beyond 2x the extra backing-store pixels cost more than they show. */
const MAX_PIXEL_RATIO = 2;

/** Resizing reallocates the whole field, so the burst a drag produces is coalesced. */
const RESIZE_DEBOUNCE = 150;

const BACKDROP =
  "radial-gradient(circle at center, #0f172a 0%, #020617 100%)";

function prefersReducedMotionNow(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * The animated backdrop. This component owns the canvas element, the browser
 * events and the frame loop; the simulation itself lives in ParticleField,
 * which has no idea any of that exists.
 */
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

    const field = new ParticleField(ctx);
    let animationFrameId = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    /** Matches the backing store to the screen, then rebuilds the field. */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      field.resize(width, height);
    };

    const animate = () => {
      field.drawFrame();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, RESIZE_DEBOUNCE);
    };

    const handleMouseMove = (e: MouseEvent) => field.setPointer(e.clientX, e.clientY);
    const handleMouseOut = () => field.clearPointer();

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
