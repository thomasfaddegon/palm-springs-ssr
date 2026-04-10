import { defineConfig } from "astro/config";
const isTruthy = (value) => String(value).toLowerCase() === "true";

import sanity from "@sanity/astro";
import react from "@astrojs/react";

// Change this depending on your hosting provider (Vercel, Netlify etc)
// https://docs.astro.build/en/guides/server-side-rendering/#adding-an-adapter
import netlify from "@astrojs/netlify";

const projectId =
  process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET;
const visualEditingEnabled = isTruthy(process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED);
const isNetlifyBuild = isTruthy(process.env.NETLIFY);
const rawStudioUrl = process.env.PUBLIC_SANITY_STUDIO_URL || "/studio";
const studioUrl =
  rawStudioUrl.startsWith("http://") ||
  rawStudioUrl.startsWith("https://") ||
  rawStudioUrl.startsWith("/")
    ? rawStudioUrl
    : `https://${rawStudioUrl}`;

// https://astro.build/config
export default defineConfig({
  // Keep Netlify deployment in SSR mode so visual editing can run reliably.
  output: "server",
  adapter: netlify(),

  integrations: [
    sanity({
      projectId,
      dataset,
      // studioBasePath: "/admin",
      useCdn: false,
      // `false` if you want to ensure fresh data at build time
      apiVersion: "2024-12-08", // Set to date of setup to use the latest API version
      stega: visualEditingEnabled
        ? {
            studioUrl,
          }
        : false,
    }),
    react(), // Required for Sanity Studio
  ],

  vite: {
    build: {
      // Work around esbuild parse issues in CI for visual editing bundles.
      minify: visualEditingEnabled || isNetlifyBuild ? false : "esbuild",
    },
    optimizeDeps: {
      include: [
        "react/compiler-runtime",
        "lodash/isObject.js",
        "lodash/groupBy.js",
        "lodash/keyBy.js",
        "lodash/partition.js",
        "lodash/sortedIndex.js",
      ],
    },
  },
});