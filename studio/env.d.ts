interface ImportMetaEnv {
  readonly SANITY_STUDIO_PROJECT_ID?: string;
  readonly SANITY_STUDIO_DATASET?: string;
  readonly SANITY_STUDIO_PREVIEW_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
