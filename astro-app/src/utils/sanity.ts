import { createClient } from "@sanity/client";
import type { PortableTextBlock } from "@portabletext/types";
import type { ImageAsset, Slug } from "@sanity/types";

const projectId =
  import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID ||
  import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset =
  import.meta.env.PUBLIC_SANITY_STUDIO_DATASET ||
  import.meta.env.PUBLIC_SANITY_DATASET;
const visualEditingByEnv =
  import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;
const studioUrl = import.meta.env.PUBLIC_SANITY_STUDIO_URL || "/studio";
function getPreviewState(preview = false) {
  const requested = visualEditingByEnv || preview;
  const hasToken = Boolean(token);
  const useDrafts = requested && hasToken;
  return { requested, hasToken, useDrafts };
}

function getPostTypeFilter(visualEditingEnabled: boolean) {
  return visualEditingEnabled
    ? `_type == "post"`
    : `_type == "post" && !(_id in path("drafts.**"))`;
}

async function runQuery<T>(
  query: string,
  params: Record<string, string> = {},
  options: { preview?: boolean } = {}
) {
  const { requested, hasToken, useDrafts } = getPreviewState(
    options.preview === true
  );
  if (requested && !hasToken) {
    console.warn(
      "Preview was requested but SANITY_API_READ_TOKEN is missing. Falling back to published content."
    );
  }

  const perspective = useDrafts ? "drafts" : "published";
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-12-08",
    useCdn: false,
    perspective,
    stega: requested
      ? {
          enabled: true,
          studioUrl,
        }
      : {
          enabled: false,
        },
    ...(useDrafts ? { token } : {}),
  });

  const { result } = await client.fetch<T>(query, params, {
    filterResponse: false,
  });

  return result;
}

export async function getPosts(preview = false): Promise<Post[]> {
  const { useDrafts } = getPreviewState(preview);
  const postTypeFilter = getPostTypeFilter(useDrafts);
  return await runQuery<Post[]>(
    `*[${postTypeFilter} && defined(slug.current) && defined(title)] | order(_createdAt desc)`,
    {},
    { preview }
  );
}

export async function getPost(slug: string, preview = false): Promise<Post | null> {
  const { useDrafts } = getPreviewState(preview);
  const postTypeFilter = getPostTypeFilter(useDrafts);
  return await runQuery<Post | null>(
    `*[${postTypeFilter} && slug.current == $slug && defined(title)][0]`,
    {
      slug,
    },
    { preview }
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
