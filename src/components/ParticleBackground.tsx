import React, { useEffect, useRef, useState } from "react";
import { ParticleField } from "../lib/particleField";
import { reportError } from "../lib/reportError";

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

    /**
     * A throw inside a frame or a listener is outside React's reach: an
     * error boundary catches render and lifecycle, and nothing else. So a
     * bad frame here would keep firing sixty times a second, uncaught,
     * with the boundary none the wiser and the page left broken.
     *
     * The backdrop is decoration. When it fails the honest thing is to
     * stop it and leave the gradient the canvas already carries, which is
     * exactly what a visitor who prefers reduced motion sees anyway.
     */
    let stopped = false;

    const stop = (error: unknown, where: string) => {
      stopped = true;
      cancelAnimationFrame(animationFrameId);
      reportError(error, where);

      // A half-painted frame is worse than none: clear it and let the
      // element's own background show through.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    /** Runs a step of the simulation, or takes the backdrop down for good. */
    const guarded =
      <A extends unknown[]>(step: (...args: A) => void, where: string) =>
      (...args: A) => {
        if (stopped) return;
        try {
          step(...args);
        } catch (error) {
          stop(error, where);
        }
      };

    const animate = () => {
      if (stopped) return;
      try {
        field.drawFrame();
      } catch (error) {
        return stop(error, "particle-frame");
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(guarded(resize, "particle-resize"), RESIZE_DEBOUNCE);
    };

    const handleMouseMove = guarded(
      (e: MouseEvent) => field.setPointer(e.clientX, e.clientY),
      "particle-pointer",
    );
    const handleMouseOut = guarded(() => field.clearPointer(), "particle-pointer");

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });

    guarded(resize, "particle-resize")();
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
