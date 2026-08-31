import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { listSourceFiles, reachableFrom } from "../scripts/importGraph";

/**
 * Ways of Working, Part 6: a control attached to nothing is deleted, not
 * wired up.
 *
 * This repository has already paid for the absence of this check. Ten
 * section components existed in two copies, a flat one and a nested one,
 * and only the nested ones were imported. The unreachable copies drifted
 * from the live ones by up to 96 lines while lint, tsc and the whole test
 * suite stayed green, so editing the wrong file changed nothing and
 * reported nothing.
 *
 * The graph below starts from the entry point and every test and story,
 * and fails on any module nothing reaches.
 */

const root = resolve(__dirname, "..");
const srcDir = resolve(root, "src");

/**
 * Ambient declaration files are loaded by the compiler through tsconfig
 * `include`, never through an import, so the import graph cannot see them by
 * design. The same is true of the vitest setup file, which is named in
 * vitest.config.ts. Excluding them removes a false positive rather than
 * relaxing the check: an unreferenced `.d.ts` is caught by noUnusedLocals
 * and by tsc having nothing to apply it to.
 */
const CONFIG_OWNED = new Set(["src/setupTests.ts"]);
const isAmbientDeclaration = (rel: string) => rel.endsWith(".d.ts");

/**
 * Files served at the root by convention. Nothing in the site links to
 * them; crawlers, the hosting platform and language models fetch them by
 * their well-known names.
 */
const ROOT_SERVED = new Set([
  "CNAME", // GitHub Pages reads the custom domain from it
  "robots.txt",
  "sitemap.xml",
  "llm.txt",
]);

describe("static assets", () => {
  /**
   * The import graph cannot see public/. Everything in it is copied into
   * the build whether or not anything asks for it, so an asset left behind
   * after the thing that used it was rewritten keeps shipping to every
   * visitor, and no check reports it.
   *
   * This repository had two: cv-qr-code.png and cv-qr-code.svg, drawn for a
   * QR that the print template stopped rendering. They were 10.9 kB per
   * deploy of a picture nothing pointed at.
   */
  it("has no file in public/ that nothing points at", () => {
    const publicDir = resolve(root, "public");

    const listAll = (dir: string): string[] =>
      readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        return statSync(full).isDirectory() ? listAll(full) : [full];
      });

    const assets = listAll(publicDir);
    expect(assets.length).toBeGreaterThan(3);

    // The content files are in the haystack because the content is no
    // longer in the source. Moving the portrait's address out of a .ts
    // module and into src/content/about.json took it out of reach of a
    // scanner that read .ts and .tsx, and this check reported the portrait
    // — which every visitor sees — as an asset nothing points at. The
    // false positive was the cheap version of the failure; the expensive
    // one is the next asset named only from content, deleted as unused.
    const contentFiles = readdirSync(resolve(srcDir, "content")).map((entry) =>
      resolve(srcDir, "content", entry),
    );

    const haystack = [
      ...listSourceFiles(srcDir),
      ...contentFiles,
      resolve(root, "index.html"),
      ...assets.filter((f) => /\.(txt|xml|html)$/.test(f)),
    ]
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");

    // Matched on the path rather than the bare filename, so a name that
    // merely appears in some unrelated string does not read as a reference.
    //
    // This does not catch an asset named through an absolute URL to another
    // origin: that string still contains the path. The portrait was written
    // that way, and what reports it is tests/portrait.test.ts, which
    // requires the address to be site-relative.
    const unreferenced = assets
      .map((f) => relative(publicDir, f).replace(/\\/g, "/"))
      .filter((name) => !ROOT_SERVED.has(name))
      .filter((name) => !haystack.includes(`/${name}`));

    expect(
      unreferenced,
      `these ship on every deploy and nothing points at them:\n  ${unreferenced.join("\n  ")}`,
    ).toEqual([]);
  });
});

describe("module reachability", () => {
  it("has no module that nothing imports", () => {
    const all = listSourceFiles(srcDir);

    // Roots: the app entry, plus every story and test, since those are
    // entry points the bundler and the runners load directly.
    const entries = [
      resolve(srcDir, "main.tsx"),
      ...all.filter((f) => /\.(stories|test|spec)\.tsx?$/.test(f)),
      ...listSourceFiles(resolve(root, "tests")),
    ];

    const reachable = reachableFrom(entries, root);

    const orphans = all
      .map((f) => relative(root, f).replace(/\\/g, "/"))
      .filter((rel) => !CONFIG_OWNED.has(rel) && !isAmbientDeclaration(rel))
      .filter((rel) => !reachable.has(resolve(root, rel)));

    expect(
      orphans,
      `these modules are imported by nothing. Delete them, or wire them up:\n  ${orphans.join("\n  ")}`,
    ).toEqual([]);
  });

  it("resolves the entry point, so the graph is not empty by accident", () => {
    // Without this, a broken entry path would make the check above pass
    // trivially with an empty reachable set.
    const reachable = reachableFrom([resolve(srcDir, "main.tsx")], root);
    expect(reachable.size).toBeGreaterThan(20);
  });
});
