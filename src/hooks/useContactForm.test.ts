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

  it("does not let a failed attempt's timer clear the retry that replaced it", async () => {
    // The window above is three seconds wide, and a visitor who sees the
    // error retries inside it. The first attempt had already scheduled a
    // return to idle, and that timer carried no attempt with it, so it
    // fired against whichever attempt was current when it landed.
    //
    // What the visitor sees, in ContactModal: the spinner disappears and
    // Send re-enables while their message is still in flight. A third click
    // sends a duplicate, and when the second attempt answers, its outcome
    // arrives out of nowhere.
    let calls = 0;
    vi.stubGlobal("fetch", () =>
      ++calls === 1
        ? Promise.resolve(new Response("", { status: 500 }))
        : new Promise(() => undefined),
    );

    const { result } = renderHook(() => useContactForm({ onSent: vi.fn() }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("error"));

    // One second into the three the error is readable for.
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    act(() => result.current.submit(submitEvent()));

    expect(result.current.status).toBe("loading");
    expect(calls, "a second request really went out").toBe(2);

    // Past the moment the first attempt's timer was set for.
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });

    expect(
      result.current.status,
      "the second attempt is still in flight and the form must still say so",
    ).toBe("loading");
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

/**
 * The dialog can be closed while a submission is still in flight. Before
 * this the state outlived the visit: the spinner was still running when the
 * dialog reopened, the send button still disabled, and the only way out was
 * a page reload.
 */
describe("ending the attempt", () => {
  it("offers a usable form again after a submission that never answered", async () => {
    // A request that never comes back, which is what stranded it.
    vi.stubGlobal("fetch", () => new Promise(() => undefined));

    const { result } = renderHook(() => useContactForm({ onSent: vi.fn() }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("loading"));

    act(() => result.current.reset());

    expect(result.current.status).toBe("idle");
  });

  it("clears a failure the visitor has already walked away from", async () => {
    respondWith("{}", 500);
    const { result } = renderHook(() => useContactForm({ onSent: vi.fn() }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.reset());

    expect(result.current.status).toBe("idle");
    expect(result.current.failure).toBeNull();
  });

  it("ignores an answer that arrives after the attempt was ended", async () => {
    // The request is left to finish — it may still deliver the message —
    // but its outcome must not reopen a screen the visitor has left.
    let settle: (value: Response) => void = () => undefined;
    vi.stubGlobal(
      "fetch",
      () => new Promise<Response>((resolve) => { settle = resolve; }),
    );

    const onSent = vi.fn();
    const { result } = renderHook(() => useContactForm({ onSent }));

    act(() => result.current.submit(submitEvent()));
    await waitFor(() => expect(result.current.status).toBe("loading"));

    act(() => result.current.reset());
    await act(async () => {
      settle(new Response(JSON.stringify({ success: true }), { status: 200 }));
      await Promise.resolve();
    });

    expect(result.current.status).toBe("idle");
    expect(onSent).not.toHaveBeenCalled();
  });

  it("keeps reset stable across renders", () => {
    const { result, rerender } = renderHook(() => useContactForm({ onSent: vi.fn() }));
    const first = result.current.reset;

    rerender();

    expect(result.current.reset).toBe(first);
  });
});
