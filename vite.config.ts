import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { countLastmod, stampSitemap } from "./scripts/sitemap";

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

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), stampSitemapPlugin()],
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
