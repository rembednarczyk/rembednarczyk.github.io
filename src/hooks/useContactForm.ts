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

  useEffect(() => {
    const timeouts = timeoutsRef;
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus("loading");

      const fields = readContactFields(event.currentTarget);

      void submitContactForm(fields).then((result) => {
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
    [schedule],
  );

  return { status, failure, submit };
}
