import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { optimizedImageUrl } from "@/utils/utils";

import { dataset, projectId } from '../env'

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
