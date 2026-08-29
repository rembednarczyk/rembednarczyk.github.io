import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join } from "node:path";
import { gzipSync } from "node:zlib";

/**
 * Serves a built directory the way the host actually serves it.
 *
 * The measurement this feeds is only worth what its conditions are worth,
 * and the first version of it got them wrong: it sent every file
 * uncompressed. GitHub Pages does not. On Lighthouse's mobile emulation
 * that one omission put 380 kB of JavaScript on the wire instead of 118 kB
 * and moved First Contentful Paint from 1.5 s to 3.1 s — a page that scores
 * 98 measured as 86, and the gap looked like a defect in the site.
 *
 * It cost a day of work on a problem that did not exist. The lesson is
 * cheaper to keep than to relearn: check the harness against production
 * before believing anything it says about production.
 */

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".map": "application/json",
  ".json": "application/json",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

/**
 * Text formats only. WebP and PNG are already compressed, and gzipping them
 * again spends time to make them very slightly larger, which is also what a
 * real host declines to do.
 */
const COMPRESSIBLE = new Set([
  ".html",
  ".js",
  ".css",
  ".map",
  ".json",
  ".svg",
  ".txt",
  ".xml",
  ".webmanifest",
]);

export function contentTypeFor(file: string): string {
  return CONTENT_TYPES[extname(file)] ?? "application/octet-stream";
}

export function isCompressible(file: string): boolean {
  return COMPRESSIBLE.has(extname(file));
}

/** Whether the request asked for gzip, in the form browsers send it. */
export function acceptsGzip(header: string | string[] | undefined): boolean {
  const value = Array.isArray(header) ? header.join(",") : (header ?? "");
  return value
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .includes("gzip");
}

/** Resolves a request path to a file inside the served directory. */
export function fileFor(root: string, url: string): string {
  const path = decodeURIComponent(url.split("?")[0]);
  return join(root, path === "/" ? "/index.html" : path);
}

/** Starts the server and resolves with the function that stops it. */
export function serveDirectory(root: string, port: number): Promise<() => void> {
  const server: Server = createServer((req, res) => {
    const file = fileFor(root, req.url ?? "/");

    if (!existsSync(file) || statSync(file).isDirectory()) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }

    res.setHeader("content-type", contentTypeFor(file));

    if (isCompressible(file) && acceptsGzip(req.headers["accept-encoding"])) {
      // No explicit content-length: node sets it from the buffer, and a
      // line that computes a value something else already provides reads
      // like it is doing work. Removing it fails no test, which is how it
      // was found; what holds the byte count is the test that asserts the
      // response is smaller than the file.
      res.setHeader("content-encoding", "gzip");
      res.end(gzipSync(readFileSync(file)));
      return;
    }

    createReadStream(file).pipe(res);
  });

  return new Promise((ready) => {
    server.listen(port, () => ready(() => server.close()));
  });
}
