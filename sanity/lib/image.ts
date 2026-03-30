import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

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
  if (!url.includes("/upload/")) return url;

  const transforms = ["q_auto", "f_auto"];

  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.width || options?.height) transforms.push("c_fill", "g_auto");

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
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
