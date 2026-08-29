import { act, renderHook, waitFor } from "@testing-library/react";
import { FormEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useContactForm } from "./useContactForm";

/**
 * The submission timing. None of this was reachable before: the machine sat
 * inside the dialog, and its two delays could only be observed by holding a
 * rendered modal open for three seconds and watching it.
 */

/** A submit event over a real form, since the fields are read off it. */
function submitEvent(): FormEvent<HTMLFormElement> {
  document.body.innerHTML = `
    <form>
      <input name="name" value="Ada" />
      <input name="email" value="ada@example.com" />
      <textarea name="message">Hello</textarea>
    </form>`;

  const form = document.querySelector("form")!;
  return {
    preventDefault: vi.fn(),
    currentTarget: form,
  } as unknown as FormEvent<HTMLFormElement>;
}

const respondWith = (body: string, status = 200) =>
  vi.stubGlobal("fetch", () =>
    Promise.resolve(
      new Response(body, { status, headers: { "Content-Type": "application/json" } }),
    ),
  );

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useContactForm", () => {
  it("stops the browser navigating away and shows the request in flight", async () => {
    respondWith('{"success":true}');
    const { result } = renderHook(() => useContactForm({ onSent: vi.fn() }));

    const event = submitEvent();
    act(() => result.current.submit(event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.status).toBe("loading");
  });

  it("reports a failure, then frees the form to be retried", async () => {
    respondWith("", 500);
    const { result } = renderHook(() => useContactForm({ onSent: vi.fn() }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.failure).toBe("rejected");

    // Still readable a moment later: an error that clears itself immediately
    // is an error nobody sees.
    await act(async () => {
      vi.advanceTimersByTime(2900);
    });
    expect(result.current.status).toBe("error");

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.status).toBe("idle");
  });

  it("names the failure it is describing", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new TypeError("Failed to fetch")));
    const { result } = renderHook(() => useContactForm({ onSent: vi.fn() }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.failure).toBe("unreachable"));
  });

  it("closes the dialog once the confirmation has been read, then resets", async () => {
    respondWith('{"success":true}');
    const onSent = vi.fn();
    const { result } = renderHook(() => useContactForm({ onSent }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("success"));

    // The confirmation stays up; closing early would hide it.
    await act(async () => {
      vi.advanceTimersByTime(2900);
    });
    expect(onSent).not.toHaveBeenCalled();
    expect(result.current.status).toBe("success");

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(onSent).toHaveBeenCalledTimes(1);

    // The reset waits for the exit animation, so the form does not flash
    // back into view behind the closing dialog.
    expect(result.current.status).toBe("success");
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.status).toBe("idle");
  });

  it("clears a stale failure when the next attempt succeeds", async () => {
    respondWith("", 500);
    const { result } = renderHook(() => useContactForm({ onSent: vi.fn() }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.failure).toBe("rejected"));

    respondWith('{"success":true}');
    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.failure).toBeNull();
  });

  it("drops pending transitions on unmount", async () => {
    respondWith('{"success":true}');
    const onSent = vi.fn();
    const { result, unmount } = renderHook(() => useContactForm({ onSent }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("success"));

    unmount();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // The close was queued before unmount. Firing it afterwards would call
    // back into a tree that is gone.
    expect(onSent).not.toHaveBeenCalled();
  });

  it("keeps one submit handler across renders", () => {
    respondWith('{"success":true}');
    // A fresh arrow each render is what every caller passes, and it is why
    // onSent is held in a ref rather than closed over.
    const { result, rerender } = renderHook(() =>
      useContactForm({ onSent: () => undefined }),
    );

    const first = result.current.submit;
    rerender();
    expect(result.current.submit).toBe(first);
  });

  it("calls the latest onSent, not the one from the render that submitted", async () => {
    respondWith('{"success":true}');
    const stale = vi.fn();
    const current = vi.fn();

    const { result, rerender } = renderHook(
      ({ onSent }: { onSent: () => void }) => useContactForm({ onSent }),
      { initialProps: { onSent: stale } },
    );

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("success"));

    rerender({ onSent: current });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(stale).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalledTimes(1);
  });
});
