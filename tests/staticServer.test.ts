import { gunzipSync } from "node:zlib";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  acceptsGzip,
  contentTypeFor,
  fileFor,
  isCompressible,
  serveDirectory,
} from "../scripts/staticServer";

/**
 * The conditions the Lighthouse gate measures under.
 *
 * This exists because the first version of that gate served everything
 * uncompressed, and GitHub Pages does not. On mobile emulation the site
 * then measured 86 instead of 98 and the gap read as a defect in the page:
 * a whole investigation, a prerendering implementation and a proposal to
 * the owner, all aimed at a problem that was in the harness.
 *
 * A measurement is worth what its conditions are worth, so the conditions
 * are tested rather than assumed.
 */

const PORT = 5188;
let root: string;
let stop: () => void;

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "static-server-"));
  mkdirSync(join(root, "assets"));

  // Long and repetitive, so gzip has something to do and the difference is
  // unambiguous rather than a handful of bytes.
  writeFileSync(join(root, "index.html"), `<!doctype html>${"<p>hello</p>".repeat(400)}`);
  writeFileSync(join(root, "assets", "app.js"), `const x = 1;`.repeat(400));
  writeFileSync(join(root, "assets", "photo.webp"), Buffer.alloc(2048, 7));

  stop = await serveDirectory(root, PORT);
});

afterAll(() => {
  stop();
  rmSync(root, { recursive: true, force: true });
});

const get = (path: string, headers: HeadersInit = { "accept-encoding": "gzip" }) =>
  fetch(`http://127.0.0.1:${PORT}${path}`, { headers });

describe("what a browser actually receives", () => {
  it("compresses the document, as the host does", async () => {
    const response = await get("/");

    expect(response.headers.get("content-encoding")).toBe("gzip");
  });

  it("compresses the script, which is where it matters most", async () => {
    // The bundle is the largest thing on the wire. Sending it uncompressed
    // is what turned a 1.5 s First Contentful Paint into 3.1 s.
    const response = await get("/assets/app.js");

    expect(response.headers.get("content-encoding")).toBe("gzip");
  });

  it("sends fewer bytes than the file holds", async () => {
    // fetch decompresses transparently, so the header alone could be a lie.
    // content-length is the compressed size the browser is billed for.
    const response = await get("/assets/app.js");
    const declared = Number(response.headers.get("content-length"));
    const body = await response.text();

    expect(declared).toBeGreaterThan(0);
    expect(declared).toBeLessThan(body.length / 2);
  });

  it("sends bytes that decompress back to the file", async () => {
    // Compressed and wrong would be worse than uncompressed.
    const response = await fetch(`http://127.0.0.1:${PORT}/assets/app.js`, {
      headers: { "accept-encoding": "gzip" },
      // @ts-expect-error Node's fetch honours this; the DOM types do not have it.
      decompress: false,
    });

    const raw = Buffer.from(await response.arrayBuffer());
    const text =
      response.headers.get("content-encoding") === "gzip" && raw[0] === 0x1f
        ? gunzipSync(raw).toString()
        : raw.toString();

    expect(text).toBe(`const x = 1;`.repeat(400));
  });

  it("leaves an image alone, which is already compressed", async () => {
    const response = await get("/assets/photo.webp");

    expect(response.headers.get("content-encoding")).toBeNull();
    expect(response.headers.get("content-type")).toBe("image/webp");
  });

  it("sends it uncompressed to a client that did not ask", async () => {
    const response = await get("/", { "accept-encoding": "identity" });

    expect(response.headers.get("content-encoding")).toBeNull();
  });

  it("answers 404 for something that is not there", async () => {
    const response = await get("/nope.html");

    expect(response.status).toBe(404);
  });
});

describe("the parts that decide all of the above", () => {
  it("reads gzip out of the header in the form browsers send it", () => {
    expect(acceptsGzip("gzip, deflate, br, zstd")).toBe(true);
    expect(acceptsGzip("br;q=1.0, gzip;q=0.8")).toBe(true);
    expect(acceptsGzip("identity")).toBe(false);
    expect(acceptsGzip(undefined)).toBe(false);
  });

  it("does not mistake a substring for the encoding", () => {
    // "x-gzip-ish" contains "gzip" and is not it.
    expect(acceptsGzip("x-gzip-ish")).toBe(false);
  });

  it("compresses text and not pictures", () => {
    expect(isCompressible("/x/app.js")).toBe(true);
    expect(isCompressible("/x/page.html")).toBe(true);
    expect(isCompressible("/x/style.css")).toBe(true);
    expect(isCompressible("/x/photo.webp")).toBe(false);
    expect(isCompressible("/x/icon.png")).toBe(false);
  });

  it("names the types a browser needs to act on", () => {
    expect(contentTypeFor("/x/page.html")).toBe("text/html");
    expect(contentTypeFor("/x/app.js")).toBe("text/javascript");
    expect(contentTypeFor("/x/unknown.bin")).toBe("application/octet-stream");
  });

  it("serves the document at the root and keeps queries out of the path", () => {
    expect(fileFor("/site", "/")).toBe("/site/index.html");
    expect(fileFor("/site", "/assets/app.js?v=2")).toBe("/site/assets/app.js");
  });
});
