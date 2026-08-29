import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Error reports carry a position inside the bundle — `index-DeyIveWb.js:17:72594`
 * — which is exact with a source map beside it and worthless without one.
 * Nothing at runtime would report the difference: the site looks identical,
 * the reports keep arriving, and every one of them points nowhere.
 *
 * So this builds the site and reads the output, rather than reading the
 * config and trusting it. A `sourcemap: true` that some later plugin or
 * minifier overrode would pass the second check and fail this one.
 */

const root = resolve(__dirname, "..");
let outDir: string;

beforeAll(() => {
  outDir = mkdtempSync(join(tmpdir(), "sourcemaps-"));

  // Built into a temporary directory so a developer's dist/ is left alone
  // and the assertions cannot pass on output from an earlier build.
  execFileSync("npx", ["vite", "build", "--outDir", outDir, "--emptyOutDir"], {
    cwd: root,
    stdio: "pipe",
  });
}, 180_000);

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});

const scripts = () => {
  const assets = join(outDir, "assets");
  return readdirSync(assets)
    .filter((name) => name.endsWith(".js"))
    .map((name) => join(assets, name));
};

describe("the deployed bundle", () => {
  it("ships a map for every script", () => {
    const built = scripts();
    expect(built.length).toBeGreaterThan(0);

    const missing = built.filter((file) => {
      try {
        return statSync(`${file}.map`).size === 0;
      } catch {
        return true;
      }
    });

    expect(
      missing.map((f) => f.replace(outDir, "")),
      "these scripts have no source map, so a reported position resolves to nothing",
    ).toEqual([]);
  });

  it("points each script at its map", () => {
    // The file existing is not enough; a browser only looks for it when the
    // script says where it is.
    for (const file of scripts()) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} has no sourceMappingURL`).toMatch(
        /\/\/# sourceMappingURL=/,
      );
    }
  });

  it("ships maps that carry the original source, not just the positions", () => {
    // `sourcesContent` is what makes a map readable without the repository
    // checked out next to it. A map without it resolves to a filename and
    // a line number that nobody can look at.
    for (const file of scripts()) {
      const map = JSON.parse(readFileSync(`${file}.map`, "utf8"));

      expect(Array.isArray(map.sources)).toBe(true);
      expect(map.sourcesContent?.length, `${file}.map has no sourcesContent`)
        .toBe(map.sources.length);
    }
  });

  it("keeps the maps out of what a visitor downloads", () => {
    // A map is fetched only when devtools are open. Inlined as a data URI
    // it would instead be downloaded by everybody, and a map is several
    // times the size of the code it describes.
    for (const file of scripts()) {
      expect(
        readFileSync(file, "utf8"),
        `${file} has its map inlined`,
      ).not.toMatch(/sourceMappingURL=data:/);
    }
  });
});
