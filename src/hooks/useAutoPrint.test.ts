import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoPrint } from "./useAutoPrint";

/**
 * The entry point a scanned QR code lands on. Nothing on the site links to
 * it, so nothing on the site would report it breaking: the only person who
 * finds out is the one holding the printed page.
 */

/** Records the address as it stood at the moment the dialog opened. */
const printedFrom: string[] = [];
const print = vi.fn(() => {
  printedFrom.push(window.location.href);
});

function visit(url: string) {
  window.history.replaceState(null, "", url);
}

beforeEach(() => {
  vi.stubGlobal("print", print);
  printedFrom.length = 0;
  visit("/");
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** A promise the test decides when to resolve. */
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("useAutoPrint", () => {
  it("opens the print dialog for the printed address", async () => {
    visit("/?print=true");
    renderHook(() => useAutoPrint());

    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
  });

  it("leaves an ordinary visit alone", async () => {
    renderHook(() => useAutoPrint());

    await new Promise((r) => setTimeout(r, 20));
    expect(print).not.toHaveBeenCalled();
  });

  it("ignores a parameter that merely ends in the same letters", async () => {
    visit("/?noprint=true");
    renderHook(() => useAutoPrint());

    await new Promise((r) => setTimeout(r, 20));
    expect(print).not.toHaveBeenCalled();
  });

  it("waits for the page to be ready before printing", async () => {
    const gate = deferred();
    visit("/?print=true");
    renderHook(() => useAutoPrint({ ready: () => gate.promise }));

    await new Promise((r) => setTimeout(r, 20));
    expect(print).not.toHaveBeenCalled();

    gate.resolve();
    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
  });

  it("prints anyway when readiness never arrives", async () => {
    // A font that fails to load would otherwise leave the dialog closed
    // forever, and the visitor with no idea why nothing happened.
    visit("/?print=true");
    renderHook(() =>
      useAutoPrint({ ready: () => new Promise(() => undefined), timeout: 10 }),
    );

    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
  });

  it("opens the dialog once, not once per signal", async () => {
    visit("/?print=true");
    renderHook(() => useAutoPrint({ ready: () => Promise.resolve(), timeout: 5 }));

    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 30));
    expect(print).toHaveBeenCalledTimes(1);
  });

  it("does not print against a page that has gone", async () => {
    const gate = deferred();
    visit("/?print=true");
    const { unmount } = renderHook(() =>
      useAutoPrint({ ready: () => gate.promise }),
    );

    unmount();
    gate.resolve();

    await new Promise((r) => setTimeout(r, 20));
    expect(print).not.toHaveBeenCalled();
  });

  it("drops the print request from the address before the dialog opens", async () => {
    visit("/?print=true");
    renderHook(() => useAutoPrint());

    await waitFor(() => expect(print).toHaveBeenCalled());

    // Asserted from inside the dialog rather than afterwards: the address
    // has to be clean by the time it opens, and window.print blocks until
    // the visitor dismisses it. Otherwise a reload, or going back to the
    // page, opens the dialog again, which reads as the site being stuck.
    expect(new URL(printedFrom[0]).search).toBe("");
    expect(window.location.search).toBe("");
  });

  it("keeps the rest of the address while dropping the request", async () => {
    visit("/?utm_source=cv&print=true#contact");
    renderHook(() => useAutoPrint());

    await waitFor(() => expect(print).toHaveBeenCalled());

    const printed = new URL(printedFrom[0]);
    expect(printed.search).toBe("?utm_source=cv");
    expect(printed.hash).toBe("#contact");
  });
});
