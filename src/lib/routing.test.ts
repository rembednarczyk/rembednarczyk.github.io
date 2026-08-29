import { describe, expect, it } from "vitest";
import { OWN_PATHS, isKnownPath } from "./routing";

describe("isKnownPath", () => {
  it.each(OWN_PATHS)("answers to %s", (path) => {
    expect(isKnownPath(path)).toBe(true);
  });

  it.each([
    ["a page that never existed", "/about"],
    ["a deep path", "/blog/2024/post"],
    ["a trailing slash on the root", "//"],
    ["a directory-looking path", "/projects/"],
    ["something that looks like a file", "/resume.pdf"],
    ["a near miss", "/index.htm"],
    ["a path that merely contains a known one", "/old/index.html/"],
  ])("does not answer to %s", (_case, path) => {
    expect(isKnownPath(path)).toBe(false);
  });

  /**
   * Neither is part of the address the visitor asked for. Section
   * navigation moves by hash, and the printed QR code arrives with
   * ?print=true, so reading either as a path would answer a real visit with
   * the 404 view.
   */
  it("is given a pathname, which carries no hash or query", () => {
    expect(new URL("https://example.com/?print=true#contact").pathname).toBe("/");
    expect(isKnownPath(new URL("https://example.com/?print=true#contact").pathname)).toBe(
      true,
    );
  });

  it("lists both paths GitHub Pages serves the site from", () => {
    // 404.html is a copy of index.html, so the application decides for
    // itself which of the two it was reached by.
    expect(OWN_PATHS).toContain("/");
    expect(OWN_PATHS).toContain("/index.html");
  });
});
