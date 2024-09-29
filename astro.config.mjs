import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import relativeLinks from "astro-relative-links";
import { defineConfig } from "astro/config";
import fs from "node:fs/promises";
import path from "node:path";
import { remarkModifiedTime } from "./src/utils/remark-modified-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://fab.cba.mit.edu/classes/863.24/people/KyeShimizu",
  base: "",
  trailingSlash: "ignore",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  experimental: {
    contentCollectionCache: true,
  },

  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
    ],
  },

  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },

  integrations: [
    mdx(),
    relativeLinks(),
    tailwind(),

    react(),
    icon({
      include: {
        tabler: ["*"],
      },
    }),
    {
      name: "remove-original-images",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          const astroDir = path.join(dir.pathname, `_astro/`);
          const files = await fs.readdir(astroDir);

          for (const file of files) {
            const { name, ext } = path.parse(file);
            const { ext: hashStr } = path.parse(name);

            if (!ext) continue;
            if (!hashStr) continue;
            if (![`.jpg`, `.jpeg`, `.png`, `.webp`].includes(ext)) continue;
            if (hashStr.includes(`_`)) continue;

            console.log(`Removing original image: ${file}`);
            await fs.unlink(path.join(astroDir, file));
          }
        },
      },
    },
  ],
  // GitLab Pages requires exposed files to be located in a folder called "public".
  // So we're instructing Astro to put the static build output in a folder of that name.
  outDir: "dist",

  // The folder name Astro uses for static files (`public`) is already reserved
  // for the build output. So in deviation from the defaults we're using a folder
  // called `static` instead.
  publicDir: "static",
});
