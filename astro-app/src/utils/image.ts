import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "@sanity/types";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId:
    import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID ||
    import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset:
    import.meta.env.PUBLIC_SANITY_STUDIO_DATASET ||
    import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: "2024-12-08",
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: Image) {
  return builder.image(source);
}
