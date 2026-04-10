// Loading environment variables from .env files
// https://docs.astro.build/en/guides/configuring-astro/#environment-variables
import { loadEnv } from "vite";
const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET,
  PUBLIC_SANITY_VISUAL_EDITING_ENABLED,
  PUBLIC_SANITY_STUDIO_URL,
} = loadEnv(import.meta.env.MODE, process.cwd(), "");
import { defineConfig } from "astro/config";

// Different environments use different variables
const projectId = PUBLIC_SANITY_STUDIO_PROJECT_ID || PUBLIC_SANITY_PROJECT_ID;
const dataset = PUBLIC_SANITY_STUDIO_DATASET || PUBLIC_SANITY_DATASET;
const visualEditingEnabled = PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";

import sanity from "@sanity/astro";
import react from "@astrojs/react";

// Change this depending on your hosting provider (Vercel, Netlify etc)
// https://docs.astro.build/en/guides/server-side-rendering/#adding-an-adapter
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: visualEditingEnabled ? "server" : "static",

  ...(visualEditingEnabled
    ? {
        adapter: netlify(),
      }
    : {}),

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
            studioUrl: PUBLIC_SANITY_STUDIO_URL || "/studio",
          }
        : false,
    }),
    react(), // Required for Sanity Studio
  ],

  vite: {
    build: {
      // Work around intermittent esbuild parse issues in CI
      // for @sanity/visual-editing staging bundles.
      minify: visualEditingEnabled ? false : "esbuild",
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