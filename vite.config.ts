import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { countLastmod, stampSitemap } from "./scripts/sitemap";
import { injectPersonSchema } from "./scripts/structuredData";

/** Dates the sitemap from the build, so it cannot fall behind the content. */
function stampSitemapPlugin(): Plugin {
  return {
    name: "stamp-sitemap",
    apply: "build",
    closeBundle() {
      const file = path.resolve(__dirname, "dist/sitemap.xml");
      if (!fs.existsSync(file)) return;

      const xml = fs.readFileSync(file, "utf8");
      if (countLastmod(xml) === 0) {
        this.warn("sitemap.xml has no <lastmod> to stamp");
        return;
      }

      fs.writeFileSync(file, stampSitemap(xml, new Date()));
    },
  };
}


/**
 * Writes the schema.org Person from the data the page renders.
 *
 * It was typed out by hand beside the same facts in the data module, with
 * nothing holding the two together, and structured data is the one surface
 * whose drift nobody would notice: it is written for crawlers and read by
 * no one who could report it.
 */
const APP_INDEX = path.resolve(__dirname, "index.html");

function structuredDataPlugin(): Plugin {
  return {
    name: "structured-data",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        // Storybook builds through this same config and its own HTML entry
        // has no such tag, so the transform is scoped to the site's page.
        // Anything else is left alone rather than rejected.
        if (path.resolve(ctx.filename) !== APP_INDEX) return html;

        return injectPersonSchema(html);
      },
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      structuredDataPlugin(),
      stampSitemapPlugin(),
    ],
    build: {
      /**
       * Published, deliberately.
       *
       * Without maps every frame of a production stack reads
       * `at bl (index-DeyIveWb.js:17:72594)`, which locates nothing: the
       * error report says what broke and never where. The usual argument
       * against publishing them is that they expose the source, and this
       * source is already public in the repository the site is built from.
       *
       * They cost visitors nothing. A browser fetches a .map only when
       * devtools are open, so the download is paid by whoever is debugging.
       */
      sourcemap: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: process.env["DISABLE_HMR"] !== "true",
    },
  };
});
