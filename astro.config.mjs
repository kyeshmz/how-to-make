import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import relativeLinks from "astro-relative-links";
import { defineConfig } from "astro/config";
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
    sitemap(),
    tailwind(),

    icon({
      include: {
        tabler: ["*"],
      },
    }),
  ],
  // GitLab Pages requires exposed files to be located in a folder called "public".
  // So we're instructing Astro to put the static build output in a folder of that name.
  outDir: "public",

  // The folder name Astro uses for static files (`public`) is already reserved
  // for the build output. So in deviation from the defaults we're using a folder
  // called `static` instead.
  publicDir: "static",
});
