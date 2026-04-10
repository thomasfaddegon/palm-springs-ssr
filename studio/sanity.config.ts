import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {defineLocations, presentationTool} from 'sanity/presentation'
import {schemaTypes} from './src/schemaTypes'

function requireEnv(
  name:
    | 'SANITY_STUDIO_PROJECT_ID'
    | 'SANITY_STUDIO_DATASET',
) {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

const projectId = requireEnv('SANITY_STUDIO_PROJECT_ID')
const dataset = requireEnv('SANITY_STUDIO_DATASET')
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN?.trim() || 'http://localhost:4321'

const resolve = {
  locations: {
    post: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => ({
        locations: doc?.slug
          ? [
              {
                title: doc?.title || 'Untitled',
                href: `/post/${doc.slug}`,
              },
            ]
          : [],
      }),
    }),
  },
}

export default defineConfig({
  name: 'sanity-template-astro-clean',
  title: 'Sanity Astro Starter',
  projectId,
  dataset,
  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      previewUrl: {
        origin: previewOrigin,
      },
      resolve,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})
