import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildSubmission,
  ContactFields,
  readContactFields,
  submitContactForm,
} from "./contactForm";

const FIELDS: ContactFields = {
  name: "Ada",
  email: "ada@example.com",
  message: "Hello",
  botcheck: "",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Answers every request with this, and records what was asked. */
function stubFetch(respond: () => Promise<Response> | Response) {
  const calls: [string, RequestInit | undefined][] = [];
  vi.stubGlobal("fetch", (url: string, init?: RequestInit) => {
    calls.push([url, init]);
    return Promise.resolve(respond());
  });
  return calls;
}

const json = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("readContactFields", () => {
  function formWith(html: string): HTMLFormElement {
    document.body.innerHTML = `<form>${html}</form>`;
    return document.querySelector("form")!;
  }

  it("reads the four fields the service is sent", () => {
    const form = formWith(`
      <input name="name" value="Ada" />
      <input name="email" value="ada@example.com" />
      <textarea name="message">Hello</textarea>
      <input name="botcheck" value="" />
    `);

    expect(readContactFields(form)).toEqual(FIELDS);
  });

  it("reports a missing field as empty rather than absent", () => {
    // A field can go missing from the markup; the request shape should not
    // change shape with it.
    expect(readContactFields(formWith(`<input name="name" value="Ada" />`))).toEqual({
      name: "Ada",
      email: "",
      message: "",
      botcheck: "",
    });
  });

  it("drops a File rather than stringifying it", () => {
    // A file input under a text field's name is where "[object File]" came
    // from when the entries were spread raw.
    const form = formWith(`<input type="file" name="message" />`);

    // Established first: without a File in the entry there is nothing here
    // to coerce, and the assertion below would pass against String(value).
    expect(new FormData(form).get("message")).toBeInstanceOf(File);

    expect(readContactFields(form).message).toBe("");
  });
});

describe("buildSubmission", () => {
  it("names the sender in the subject and identifies the form", () => {
    expect(buildSubmission(FIELDS)).toEqual({
      ...FIELDS,
      access_key: "e08b2649-ead0-4885-91a3-5c8809b38c29",
      subject: "New message from Ada (Portfolio)",
      from_name: "Portfolio Contact Form",
    });
  });

  it("carries the honeypot through, since the service is what judges it", () => {
    expect(buildSubmission({ ...FIELDS, botcheck: "on" }).botcheck).toBe("on");
  });
});

describe("submitContactForm", () => {
  it("posts JSON to the form service", async () => {
    const calls = stubFetch(() => json('{"success":true}'));
    await submitContactForm(FIELDS);

    const [url, init] = calls[0];
    expect(url).toBe("https://api.web3forms.com/submit");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    expect(JSON.parse(String(init?.body))).toEqual(buildSubmission(FIELDS));
  });

  it("reports the service as unreachable when the request never completes", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new TypeError("Failed to fetch")));

    await expect(submitContactForm(FIELDS)).resolves.toEqual({
      ok: false,
      reason: "unreachable",
    });
  });

  /**
   * The guard this pins could not be reached from the dialog: every rejection
   * path produces the same sentence, so removing it changed nothing anyone
   * could observe. What it actually does is leave the body alone, and that
   * is observable here.
   */
  it("does not read the body of an error response", async () => {
    const read = vi.fn();
    vi.stubGlobal("fetch", () =>
      Promise.resolve({ ok: false, status: 422, json: read } as unknown as Response),
    );

    await expect(submitContactForm(FIELDS)).resolves.toEqual({
      ok: false,
      reason: "rejected",
    });
    expect(read).not.toHaveBeenCalled();
  });

  it.each([
    ["a body that is not JSON at all", "<html>gateway</html>"],
    ["an empty body", ""],
    ["a refusal", '{"success":false}'],
    ["no success field", '{"message":"queued"}'],
    ["a null body", "null"],
    ["success as a string rather than a boolean", '{"success":"true"}'],
    ["a bare array", "[]"],
  ])("treats %s as a rejection", async (_case, body) => {
    stubFetch(() => json(body));

    await expect(submitContactForm(FIELDS)).resolves.toEqual({
      ok: false,
      reason: "rejected",
    });
  });

  it("reports success only when the service says so", async () => {
    stubFetch(() => json('{"success":true}'));
    await expect(submitContactForm(FIELDS)).resolves.toEqual({ ok: true });
  });

  it("never throws, whatever the service does", async () => {
    vi.stubGlobal("fetch", () => {
      throw new Error("thrown rather than rejected");
    });

    await expect(submitContactForm(FIELDS)).resolves.toEqual({
      ok: false,
      reason: "unreachable",
    });
  });
});
