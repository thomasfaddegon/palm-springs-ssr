/**
 * Sanity CLI Configuration
 * This file configures the Sanity CLI tool with project-specific settings
 * and customizes the Vite bundler configuration.
 * Learn more: https://www.sanity.io/docs/cli
 */

import {defineCliConfig} from 'sanity/cli'

function requireEnv(name: 'SANITY_STUDIO_PROJECT_ID' | 'SANITY_STUDIO_DATASET') {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

const projectId = requireEnv('SANITY_STUDIO_PROJECT_ID')
const dataset = requireEnv('SANITY_STUDIO_DATASET')

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost: process.env.SANITY_STUDIO_STUDIO_HOST || '', // Visit https://www.sanity.io/docs/environment-variables to learn more about local & production env vars.
  deployment: {
    autoUpdates: true,
    appId: 'yxu3jdnoin8ji6vlb0nus5za',
  },
})
