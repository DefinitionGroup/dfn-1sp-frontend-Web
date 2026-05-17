import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from './env'

// Inlined from utils/utils.ts to keep this package self-contained.
// When packages/utils is extracted, this duplicate should be removed
// and imported from there instead.
const optimizedImageUrl = (
  url?: string,
  options?: {
    width?: number;
    height?: number;
    quality?: "auto" | "eco" | "good" | "best";
    crop?: "limit" | "fill";
    gravity?: "auto";
  },
): string | undefined => {
  if (!url) return url;
  if (!url.includes("/upload/")) return url;

  const quality = options?.quality ?? "auto";
  const transforms: string[] = [
    quality === "auto" ? "q_auto" : `q_auto:${quality}`,
    "f_auto",
  ];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);
  if (options?.gravity) transforms.push(`g_${options.gravity}`);

  return url.replace(/\/upload\//, `/upload/${transforms.join(",")}/`);
};

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

function buildCloudinaryImageUrl(
  url: string,
  options?: { width?: number; height?: number },
) {
  return (
    optimizedImageUrl(url, {
      width: options?.width,
      height: options?.height,
      crop: options?.width || options?.height ? "fill" : undefined,
      gravity: options?.width || options?.height ? "auto" : undefined,
    }) || url
  );
}

export function resolveImageUrl(
  source: unknown,
  options?: { width?: number; height?: number },
): string | undefined {
  const cloudinaryUrl =
    (source as any)?.asset?.secure_url ||
    (source as any)?.asset?.url ||
    (source as any)?.secure_url ||
    (source as any)?.url;

  if (cloudinaryUrl) {
    return buildCloudinaryImageUrl(cloudinaryUrl, options);
  }

  if (!source) return undefined;

  let image = urlFor(source as SanityImageSource);
  if (options?.width) image = image.width(options.width);
  if (options?.height) image = image.height(options.height);
  return image.url();
}
