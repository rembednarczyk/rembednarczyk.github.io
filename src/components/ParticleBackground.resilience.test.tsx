import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ParticleBackground } from "./ParticleBackground";
import { reportError } from "../lib/reportError";

/**
 * The gap the error boundary does not cover.
 *
 * React catches a throw in render and in lifecycle, and nothing else. The
 * backdrop runs a requestAnimationFrame loop and three window listeners,
 * all of them outside that reach: a bad frame there would keep throwing
 * sixty times a second, uncaught, while the boundary sat one level up with
 * no idea anything was wrong.
 *
 * The backdrop is decoration, so the answer is not a fallback screen. It is
 * to stop, say so, and leave the page working without it.
 */

/**
 * A stand-in field whose behaviour each test sets. A constructor may return
 * an object, and that object is what `new` yields, which is how the
 * component gets this one without knowing.
 */
const stub = vi.hoisted(() => ({
  api: null as unknown as {
    drawFrame: () => void;
    resize: () => void;
    setPointer: () => void;
    clearPointer: () => void;
  },
}));

vi.mock("../lib/particleField", () => ({
  ParticleField: class {
    constructor() {
      return stub.api;
    }
  },
}));
vi.mock("../lib/reportError");

const mockedReport = vi.mocked(reportError);

/**
 * Frames run by hand, so a loop that refuses to stop cannot hang the test.
 *
 * The queue is keyed by id and cancelAnimationFrame really removes from it.
 * A no-op double would have been simpler and would have hidden a frame the
 * browser is still holding: the flag that makes such a frame harmless is
 * the very thing under test here.
 */
let queue: Map<number, FrameRequestCallback>;
let nextFrameId: number;

/**
 * Kept even after the queue drains, so a test can deliver a frame that was
 * scheduled before the failure — which is what a browser does.
 */
let lastScheduled: FrameRequestCallback | undefined;

function runFrame() {
  const [id, cb] = queue.entries().next().value ?? [];
  if (id === undefined || !cb) return;
  queue.delete(id);
  cb(performance.now());
}

const context = () =>
  ({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
  }) as unknown as CanvasRenderingContext2D;

let ctx: CanvasRenderingContext2D;

beforeEach(() => {
  queue = new Map();
  nextFrameId = 1;
  lastScheduled = undefined;
  ctx = context();

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = nextFrameId++;
    lastScheduled = cb;
    queue.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => queue.delete(id));
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

/** A field whose drawFrame throws from the nth call onwards. */
function fieldThatFailsFrom(n: number) {
  let calls = 0;
  const drawFrame = vi.fn(() => {
    calls += 1;
    if (calls >= n) throw new TypeError("the simulation went wrong");
  });

  stub.api = {
    drawFrame,
    resize: vi.fn(),
    setPointer: vi.fn(),
    clearPointer: vi.fn(),
  };

  return drawFrame;
}

describe("when a frame throws", () => {
  it("does not let the throw escape into the page", () => {
    fieldThatFailsFrom(1);

    // The first frame runs inside the effect, synchronously.
    expect(() => render(<ParticleBackground />)).not.toThrow();
  });

  it("stops the loop instead of throwing sixty times a second", () => {
    const drawFrame = fieldThatFailsFrom(3);

    // The first frame runs inside the effect, so two more reach the third.
    render(<ParticleBackground />);
    runFrame();
    runFrame();

    expect(drawFrame).toHaveBeenCalledTimes(3);

    // Checked here rather than after another frame: one more runFrame would
    // consume the very frame a broken guard had scheduled, and the queue
    // would look empty for the wrong reason.
    expect(queue.size, "a frame was scheduled after the failure").toBe(0);
  });

  it("refuses to run again even if a frame it already scheduled arrives", () => {
    // requestAnimationFrame callbacks cannot be unqueued reliably: a frame
    // handed to the browser before the failure can still be delivered
    // after it.
    const drawFrame = fieldThatFailsFrom(2);

    render(<ParticleBackground />);
    runFrame();
    expect(drawFrame).toHaveBeenCalledTimes(2);

    lastScheduled?.(performance.now());
    expect(drawFrame).toHaveBeenCalledTimes(2);
  });

  it("reports it once, not once per frame", () => {
    fieldThatFailsFrom(1);
    render(<ParticleBackground />);
    runFrame();
    runFrame();

    expect(mockedReport).toHaveBeenCalledTimes(1);
    expect(mockedReport).toHaveBeenCalledWith(
      expect.any(TypeError),
      "particle-frame",
    );
  });

  it("clears the canvas rather than leaving half a frame on screen", () => {
    fieldThatFailsFrom(1);
    render(<ParticleBackground />);

    // Reset first, or the clear is scaled by the device pixel ratio and
    // misses the bottom right of the backing store.
    expect(ctx.setTransform).toHaveBeenLastCalledWith(1, 0, 0, 1, 0, 0);
    expect(ctx.clearRect).toHaveBeenCalled();
  });

  it("leaves the rest of the page standing", () => {
    fieldThatFailsFrom(1);
    const { container } = render(
      <>
        <ParticleBackground />
        <p>the page</p>
      </>,
    );

    expect(container.textContent).toContain("the page");
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});

describe("when a listener throws", () => {
  it("takes the backdrop down without letting the event throw", () => {
    stub.api = {
      drawFrame: vi.fn(),
      resize: vi.fn(),
      setPointer: vi.fn(() => {
        throw new TypeError("pointer went wrong");
      }),
      clearPointer: vi.fn(),
    };

    render(<ParticleBackground />);
    expect(() =>
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 5, clientY: 5 })),
    ).not.toThrow();

    expect(mockedReport).toHaveBeenCalledWith(
      expect.any(TypeError),
      "particle-pointer",
    );

    // One report, however many times the mouse moves afterwards.
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 6, clientY: 6 }));
    expect(mockedReport).toHaveBeenCalledTimes(1);
  });

  it("takes back the frame it had already asked for", () => {
    // Unlike a frame that throws, a listener fails while the next frame is
    // outstanding. Leaving it queued means the browser still wakes the page
    // once more for a loop that is finished.
    stub.api = {
      drawFrame: vi.fn(),
      resize: vi.fn(),
      setPointer: vi.fn(() => {
        throw new TypeError("pointer went wrong");
      }),
      clearPointer: vi.fn(),
    };

    render(<ParticleBackground />);
    expect(queue.size, "no frame was outstanding to begin with").toBe(1);

    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 5, clientY: 5 }));

    expect(queue.size).toBe(0);
  });
});

describe("when nothing is wrong", () => {
  it("keeps scheduling frames", () => {
    // Otherwise every test above would pass against a backdrop that never
    // ran at all.
    const drawFrame = fieldThatFailsFrom(Number.POSITIVE_INFINITY);
    render(<ParticleBackground />);

    runFrame();
    runFrame();

    expect(drawFrame).toHaveBeenCalledTimes(3);
    expect(queue.size).toBe(1);
    expect(mockedReport).not.toHaveBeenCalled();
  });
});
