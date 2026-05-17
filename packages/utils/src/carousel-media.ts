import {
  cloudinaryPosterUrl,
  optimizedImageUrl,
  optimizedVideoUrl,
} from "./cloudinary";

export interface CarouselVideoSource {
  media?: string;
  src: string;
}

const CAROUSEL_DESKTOP_WIDTH = 1280;
const CAROUSEL_MOBILE_WIDTH = 640;
const CAROUSEL_THUMB_WIDTH = 176;
const CAROUSEL_LOGO_WIDTH = 240;
export function getCarouselVideoSources(url?: string): CarouselVideoSource[] {
  const mobile = optimizedVideoUrl(url, {
    maxWidth: CAROUSEL_MOBILE_WIDTH,
    quality: "eco",
    autoCodec: true,
  });

  const desktop = optimizedVideoUrl(url, {
    maxWidth: CAROUSEL_DESKTOP_WIDTH,
    quality: "good",
    autoCodec: true,
  });

  if (!mobile && !desktop) return [];
  if (mobile && desktop && mobile === desktop) return [{ src: desktop }];

  const sources: Array<CarouselVideoSource | undefined> = [
    mobile ? { media: "(max-width: 768px)", src: mobile } : undefined,
    desktop ? { media: "(min-width: 769px)", src: desktop } : undefined,
  ];

  return sources.filter((source): source is CarouselVideoSource => Boolean(source?.src));
}

export function getCarouselPosterUrl(url?: string): string | undefined {
  return cloudinaryPosterUrl(url, { maxWidth: CAROUSEL_DESKTOP_WIDTH });
}

export function getCarouselImageUrl(url?: string): string | undefined {
  return optimizedImageUrl(url, {
    width: CAROUSEL_DESKTOP_WIDTH,
    quality: "good",
    crop: "limit",
  });
}

export function getCarouselThumbnailUrl(url?: string): string | undefined {
  return optimizedImageUrl(url, {
    width: CAROUSEL_THUMB_WIDTH,
    quality: "eco",
    crop: "limit",
  });
}

export function getCarouselLogoUrl(url?: string): string | undefined {
  return optimizedImageUrl(url, {
    width: CAROUSEL_LOGO_WIDTH,
    crop: "limit",
  });
}
