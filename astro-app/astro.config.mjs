import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
const isTruthy = (value) => String(value).toLowerCase() === "true";

import sanity from "@sanity/astro";
import react from "@astrojs/react";

// Change this depending on your hosting provider (Vercel, Netlify etc)
// https://docs.astro.build/en/guides/server-side-rendering/#adding-an-adapter
import netlify from "@astrojs/netlify";

const fileEnv = loadEnv(process.env.NODE_ENV || "production", process.cwd(), "");
const env = {
  ...fileEnv,
  ...process.env,
};

const projectId =
  env.PUBLIC_SANITY_STUDIO_PROJECT_ID || env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_STUDIO_DATASET || env.PUBLIC_SANITY_DATASET;
const visualEditingEnabled = isTruthy(env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED);
const isNetlifyBuild = isTruthy(env.NETLIFY);
const isStaticBuild = env.BUILD_MODE === "static";
const rawStudioUrl = env.PUBLIC_SANITY_STUDIO_URL || "/studio";
const studioUrl =
  rawStudioUrl.startsWith("http://") ||
  rawStudioUrl.startsWith("https://") ||
  rawStudioUrl.startsWith("/")
    ? rawStudioUrl
    : `https://${rawStudioUrl}`;

// https://astro.build/config
export default defineConfig({
  output: isStaticBuild ? "static" : "server",
  ...(isStaticBuild ? {} : { adapter: netlify() }),

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