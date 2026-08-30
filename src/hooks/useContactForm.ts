import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ContactFailureReason,
  readContactFields,
  submitContactForm,
} from "../lib/contactForm";

export type ContactStatus = "idle" | "loading" | "success" | "error";

/** How long the outcome stays on screen before the form is usable again. */
const OUTCOME_VISIBLE = 3000;

/** Long enough for the dialog's exit animation, so the reset is not seen. */
const RESET_AFTER_CLOSE = 300;

export interface UseContactFormOptions {
  /** Called once the success message has been read. Usually closes the dialog. */
  onSent: () => void;
}

export interface ContactFormState {
  status: ContactStatus;
  /** Which failure the error message should describe. Null unless status is "error". */
  failure: ContactFailureReason | null;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * Ends the attempt and returns the form to its opening state. The dialog
   * calls this when it closes.
   */
  reset: () => void;
}

/**
 * The submission state machine: idle, loading, then either outcome, and back
 * to idle on a timer.
 *
 * It sits between the dialog and the transport because it belongs to
 * neither. The dialog renders a sentence; the transport reports what
 * happened; the timing of the two, and the bookkeeping that keeps a pending
 * transition from firing into an unmounted tree, is this.
 */
export function useContactForm({ onSent }: UseContactFormOptions): ContactFormState {
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [failure, setFailure] = useState<ContactFailureReason | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /**
   * Counts attempts, so an answer that arrives after its attempt was
   * abandoned cannot put the dialog back into a state the visitor has left.
   */
  const attemptRef = useRef(0);

  // Callers usually pass an inline arrow, which would otherwise make submit a
  // fresh function on every parent render.
  const onSentRef = useRef(onSent);
  useEffect(() => {
    onSentRef.current = onSent;
  }, [onSent]);

  /** Tracked so pending status transitions cannot fire after unmount. */
  const schedule = useCallback((fn: () => void, delay: number) => {
    timeoutsRef.current.push(setTimeout(fn, delay));
  }, []);

  /**
   * Drops every transition the previous attempt was still waiting to make.
   *
   * `attemptRef` guarded the promise, so an answer arriving late could not
   * put the dialog back into a state the visitor had left. It did not guard
   * the timers, and a timer carries no attempt with it: the one scheduled
   * to clear an error three seconds later fired against whichever attempt
   * was current when it landed. A visitor who retried inside those three
   * seconds — which is what the window is for — had the spinner cleared and
   * Send re-enabled while their message was still in flight, so a third
   * click sent a duplicate.
   */
  const cancelPending = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  /**
   * Ends the attempt and returns to the opening state.
   *
   * Without this the state outlived the visit: a submission still in flight
   * left the dialog spinning, and closing and reopening it showed the same
   * spinner, because nothing had reset. The message was neither sent nor
   * retryable, and only a page reload cleared it.
   *
   * The request itself is left to finish. It may well be delivered, and a
   * duplicate message is a far smaller harm than a lost one.
   */
  const reset = useCallback(() => {
    attemptRef.current += 1;
    cancelPending();
    setStatus("idle");
    setFailure(null);
  }, [cancelPending]);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // A new attempt supersedes the one before it, including whatever that
      // one had scheduled. Without this the retry inherited the previous
      // attempt's return-to-idle timer.
      cancelPending();
      setStatus("loading");

      const fields = readContactFields(event.currentTarget);
      const attempt = (attemptRef.current += 1);

      void submitContactForm(fields).then((result) => {
        // Abandoned while it was in flight: the visitor has moved on and
        // this answer is about a screen that is no longer there.
        if (attemptRef.current !== attempt) return;

        if (!result.ok) {
          // Set together in one place so the reason can never disagree with
          // the status it explains.
          setFailure(result.reason);
          setStatus("error");
          schedule(() => setStatus("idle"), OUTCOME_VISIBLE);
          return;
        }

        setFailure(null);
        setStatus("success");
        schedule(() => {
          onSentRef.current();
          schedule(() => setStatus("idle"), RESET_AFTER_CLOSE);
        }, OUTCOME_VISIBLE);
      });
    },
    [cancelPending, schedule],
  );

  return { status, failure, submit, reset };
}
