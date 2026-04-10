import { createClient } from "@sanity/client";
import type { PortableTextBlock } from "@portabletext/types";
import type { ImageAsset, Slug } from "@sanity/types";

const projectId =
  import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID ||
  import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset =
  import.meta.env.PUBLIC_SANITY_STUDIO_DATASET ||
  import.meta.env.PUBLIC_SANITY_DATASET;
const visualEditingEnabled =
  import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;
const studioUrl = import.meta.env.PUBLIC_SANITY_STUDIO_URL || "/studio";
const postTypeFilter = visualEditingEnabled
  ? `_type == "post"`
  : `_type == "post" && !(_id in path("drafts.**"))`;

async function runQuery<T>(query: string, params: Record<string, string> = {}) {
  if (visualEditingEnabled && !token) {
    throw new Error(
      "SANITY_API_READ_TOKEN is required when PUBLIC_SANITY_VISUAL_EDITING_ENABLED is true."
    );
  }

  const perspective = visualEditingEnabled ? "drafts" : "published";
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-12-08",
    useCdn: false,
    perspective,
    stega: visualEditingEnabled
      ? {
          enabled: true,
          studioUrl,
        }
      : {
          enabled: false,
        },
    ...(visualEditingEnabled ? { token } : {}),
  });

  const { result } = await client.fetch<T>(query, params, {
    filterResponse: false,
  });

  return result;
}

export async function getPosts(): Promise<Post[]> {
  return await runQuery<Post[]>(
    `*[${postTypeFilter} && defined(slug.current) && defined(title)] | order(_createdAt desc)`
  );
}

export async function getPost(slug: string): Promise<Post | null> {
  return await runQuery<Post | null>(
    `*[${postTypeFilter} && slug.current == $slug && defined(title)][0]`,
    {
      slug,
    }
  );
}

export interface Post {
  _type: "post";
  _createdAt: string;
  title?: string;
  slug: Slug;
  excerpt?: string;
  mainImage?: ImageAsset & { alt?: string };
  body: PortableTextBlock[];
}
