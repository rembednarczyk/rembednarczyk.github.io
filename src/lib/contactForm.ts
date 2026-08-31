/**
 * The contact form's transport: what leaves the browser and how the answer
 * is read. It has no React in it and no view, so the rules below can be
 * checked directly instead of by typing into a dialog and watching for a
 * sentence to appear.
 */

const ENDPOINT = "https://api.web3forms.com/submit";

/** Public by design: web3forms identifies the destination inbox, not the sender. */
const ACCESS_KEY = "e08b2649-ead0-4885-91a3-5c8809b38c29";

/**
 * Why the failure is split in two: a request the service rejected and a
 * request that never arrived are different statements, and telling someone
 * "something went wrong" when their connection dropped sends them looking
 * in the wrong place. Only the second is worth retrying immediately.
 */
export type ContactFailureReason = "rejected" | "unreachable";

export interface ContactFields {
  name: string;
  email: string;
  message: string;
  /** Honeypot. Filled in only by something that is not reading the page. */
  botcheck: string;
}

export interface ContactSubmission extends ContactFields {
  access_key: string;
  subject: string;
  from_name: string;
}

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: ContactFailureReason };

/**
 * How long a submission is given before it is called unreachable.
 *
 * fetch has no timeout of its own. A socket that opens and then goes quiet
 * — a captive portal, a service that accepts the connection and stops
 * answering — leaves the promise pending for as long as the page is open,
 * and the dialog spinning with it. The visitor's message is then neither
 * sent nor recoverable.
 *
 * Fifteen seconds is longer than this request has ever taken and short
 * enough that somebody is still watching the screen when it gives up.
 */
const REQUEST_TIMEOUT = 15000;

export interface SubmitOptions {
  /** Overridden in tests, which cannot wait fifteen seconds. */
  timeout?: number;
}

/**
 * Reads the four fields out of a submitted form.
 *
 * FormData entries are `string | File`, so each field is read and coerced
 * explicitly. Spreading the raw entries once let a File reach the subject
 * line, where it would have stringified to "[object File]".
 */
export function readContactFields(form: HTMLFormElement): ContactFields {
  const data = new FormData(form);

  const field = (key: string): string => {
    const value = data.get(key);
    // get() returns string | File | null. A File in a text field has no
    // useful string form; String() would send "[object File]".
    return typeof value === "string" ? value : "";
  };

  return {
    name: field("name"),
    email: field("email"),
    message: field("message"),
    botcheck: field("botcheck"),
  };
}

/** The exact body that goes over the wire. */
export function buildSubmission(fields: ContactFields): ContactSubmission {
  return {
    ...fields,
    access_key: ACCESS_KEY,
    subject: `New message from ${fields.name} (Portfolio)`,
    from_name: "Portfolio Contact Form",
  };
}

/**
 * Sends the message and reports which of the two things happened. It never
 * throws: a caller of this is rendering a sentence, and an exception is not
 * one of the two sentences it can render.
 */
export async function submitContactForm(
  fields: ContactFields,
  { timeout = REQUEST_TIMEOUT }: SubmitOptions = {},
): Promise<ContactResult> {
  const controller = new AbortController();
  const expiry = setTimeout(() => controller.abort(), timeout);

  // Covers reading the body as well as the request. A service that sends
  // headers and then stops mid-body hangs exactly like one that never
  // answers, and the visitor cannot tell the difference either.
  try {
    let response: Response;

    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(buildSubmission(fields)),
        signal: controller.signal,
      });
    } catch {
      // fetch rejects only when the request never completed, which now
      // includes having run out of time.
      return { ok: false, reason: "unreachable" };
    }

    // An error response carries no result to read, so it is not parsed for
    // one. The outcome matches what the checks below would reach anyway;
    // what this guard buys is that the body is left alone.
    if (!response.ok) return { ok: false, reason: "rejected" };

    // The body is untrusted input, so it is narrowed rather than assumed to
    // match a declared shape.
    let parsed: unknown;

    try {
      parsed = await response.json();
    } catch {
      // A body that never finished arriving is the same failure as a
      // request that never did, and is worth retrying for the same reason.
      return controller.signal.aborted
        ? { ok: false, reason: "unreachable" }
        : { ok: false, reason: "rejected" };
    }

    const accepted =
      typeof parsed === "object" &&
      parsed !== null &&
      "success" in parsed &&
      parsed.success === true;

    return accepted ? { ok: true } : { ok: false, reason: "rejected" };
  } finally {
    clearTimeout(expiry);
  }
}
