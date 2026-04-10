import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'

function requireEnv(name: 'SANITY_STUDIO_PROJECT_ID' | 'SANITY_STUDIO_DATASET') {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

const projectId = requireEnv('SANITY_STUDIO_PROJECT_ID')
const dataset = requireEnv('SANITY_STUDIO_DATASET')

export default defineConfig({
  name: 'sanity-template-astro-clean',
  title: 'Sanity Astro Starter',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
