/**
 * Social Sharing Images
 * =====================
 *
 * Builds og:image / twitter:image for every 1SP route so crawlers always get a
 * 1200×630 still: Cloudinary videos become their first frame, large originals
 * are cropped to size, and pages without a usable image get the site default.
 */
import { resolveImageUrl } from "@1sp/sanity-queries/image";
import {
  assetUrl,
  cloudinaryPosterUrl,
  isVideoAsset,
} from "@1sp/utils/cloudinary";

type MediaAsset = Parameters<typeof isVideoAsset>[0];

const SHARING_IMAGE_SIZE = { width: 1200, height: 630 };

// Current 1SP homepage sharing still.
export const DEFAULT_SHARING_IMAGE_URL =
  "https://res.cloudinary.com/dsu07dnes/image/upload/q_auto,f_auto,w_1200,h_630,c_fill,g_auto/v1758116533/s1_nm8hbt.png";

/**
 * 1200×630 still for a CMS image, Cloudinary asset or image URL.
 * Returns undefined when there is nothing usable, e.g. a non-Cloudinary video.
 */
export function sharingImageUrl(source: unknown): string | undefined {
  if (!source) return undefined;

  const image = typeof source === "string" ? { secure_url: source } : source;
  const asset = ((image as { asset?: MediaAsset }).asset ?? image) as MediaAsset;
  const url = assetUrl(asset);

  if (url && isVideoAsset(asset, url)) {
    const poster = cloudinaryPosterUrl(url);
    return poster
      ? resolveImageUrl({ secure_url: poster }, SHARING_IMAGE_SIZE)
      : undefined;
  }

  return resolveImageUrl(image, SHARING_IMAGE_SIZE);
}

/** Metadata images for a page, falling back to the 1SP default still. */
export function sharingImages(source: unknown, alt?: string | null) {
  return [
    {
      url: sharingImageUrl(source) ?? DEFAULT_SHARING_IMAGE_URL,
      ...SHARING_IMAGE_SIZE,
      alt: alt || undefined,
    },
  ];
}
