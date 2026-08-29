import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ParticleBackground } from "./ParticleBackground";
import {
  FakePath2D,
  RecordingContext,
  seededRandom,
} from "../test/canvasRecording";

/**
 * A characterization suite: it records what the component actually paints
 * and pins it, so extracting the simulation could be checked against the
 * current output rather than against a description of it. The snapshot was
 * taken before the extraction and is unchanged by it.
 *
 * Nothing here asserts that the output is correct. It asserts that it does
 * not change.
 */

let ctx: RecordingContext;
let frames: FrameRequestCallback[];
let cancelFrame: ReturnType<typeof vi.fn>;

/** Runs the frame the last one queued. */
function nextFrame() {
  const cb = frames.shift();
  if (!cb) throw new Error("no animation frame was requested");
  cb(0);
}

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: height, configurable: true });
}

beforeEach(() => {
  ctx = new RecordingContext();
  frames = [];
  cancelFrame = vi.fn();

  // 400x300 puts the particle count at 10, small enough for the recorded
  // log to stay readable while still exercising linking and the grid.
  setViewport(400, 300);

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx.asCanvasContext(),
  );
  vi.stubGlobal("Path2D", FakePath2D);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", cancelFrame);
  vi.spyOn(Math, "random").mockImplementation(seededRandom(20260829));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ParticleBackground", () => {
  it("paints the same frames as before the simulation was extracted", () => {
    render(<ParticleBackground />);

    // The effect draws one frame synchronously; two more are stepped here so
    // motion, wall bounces and the rebuilt grid are all inside the record.
    nextFrame();
    nextFrame();

    expect(ctx.ops).toMatchSnapshot();
  });

  it("links particles to the cursor and drops them when it leaves", () => {
    render(<ParticleBackground />);

    const cursorStrokes = () => {
      const start = ctx.ops.length;
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 150 }));
      nextFrame();
      return ctx.ops.slice(start).filter((op) => op.startsWith("strokeStyle=rgba(139"));
    };

    // Cursor links are the only thing drawn in that purple; particle bodies
    // are filled, not stroked.
    expect(cursorStrokes().length).toBeGreaterThan(0);

    window.dispatchEvent(new MouseEvent("mouseout"));
    const start = ctx.ops.length;
    nextFrame();
    expect(
      ctx.ops.slice(start).filter((op) => op.startsWith("strokeStyle=rgba(139")),
    ).toHaveLength(0);
  });

  it("scales the backing store for a high-DPI screen and caps the ratio at 2", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 3, configurable: true });

    const { container } = render(<ParticleBackground />);
    const canvas = container.querySelector("canvas")!;

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    expect(canvas.style.width).toBe("400px");
    expect(canvas.style.height).toBe("300px");
    expect(ctx.ops).toContain("setTransform(2,0,0,2,0,0)");

    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
  });

  it("stops animating and releases its listeners on unmount", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<ParticleBackground />);
    const subscribed = add.mock.calls.map(([type]) => type);
    expect(subscribed).toEqual(
      expect.arrayContaining(["resize", "mousemove", "mouseout"]),
    );

    unmount();

    const released = remove.mock.calls.map(([type]) => type);
    for (const type of ["resize", "mousemove", "mouseout"]) {
      expect(released).toContain(type);
    }
    expect(cancelFrame).toHaveBeenCalled();
  });

  it("renders a still backdrop and never opens a canvas under reduced motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );

    const { container } = render(<ParticleBackground />);

    expect(container.querySelector("canvas")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(ctx.ops).toHaveLength(0);
    expect(frames).toHaveLength(0);
  });
});
