import { cloudinaryPosterUrl, cloudinaryPosterSrcSet } from "@/utils/utils";

/**
 * Extract the hero video URL from page builder content.
 * Used server-side to generate <link rel="preload"> hints so the browser
 * starts downloading the LCP poster image during HTML parse.
 */
export function extractHeroVideoUrl(content: any[]): string | undefined {
    if (!Array.isArray(content)) return undefined;
    for (const block of content) {
        if (block?._type === "oneSPHeader") {
            const media = block?.media;
            const url = media?.secure_url || media?.url;
            if (url && (/\/video\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url))) {
                return url;
            }
        }
    }
    return undefined;
}

export interface HeroPreloadData {
    heroVideoUrl: string | undefined;
    heroPosterDesktop: string | undefined;
    heroPosterMobile: string | undefined;
    heroPosterDesktopSrcSet: string | undefined;
    heroPosterMobileSrcSet: string | undefined;
}

/**
 * Compute all hero poster URLs and srcSets from page builder content.
 * Call once in the server component, then spread into HeroPreloadLinks.
 */
export function getHeroPreloadData(
    content: any[] | null | undefined,
): HeroPreloadData {
    const heroVideoUrl = content
        ? extractHeroVideoUrl(content as any[])
        : undefined;

    return {
        heroVideoUrl,
        heroPosterDesktop: heroVideoUrl
            ? cloudinaryPosterUrl(heroVideoUrl, { maxWidth: 1280 })
            : undefined,
        heroPosterMobile: heroVideoUrl
            ? cloudinaryPosterUrl(heroVideoUrl, { maxWidth: 480, portrait: true })
            : undefined,
        heroPosterDesktopSrcSet: heroVideoUrl
            ? cloudinaryPosterSrcSet(heroVideoUrl, [960, 1280, 1600, 1920])
            : undefined,
        heroPosterMobileSrcSet: heroVideoUrl
            ? cloudinaryPosterSrcSet(heroVideoUrl, [360, 480, 640, 750], {
                portrait: true,
            })
            : undefined,
    };
}

/**
 * Server component that renders <link rel="preload"> tags for the hero poster.
 * Drop into any page's JSX to preload the hero image during HTML parse.
 */
export function HeroPreloadLinks({
    heroVideoUrl,
    heroPosterDesktop,
    heroPosterMobile,
    heroPosterDesktopSrcSet,
    heroPosterMobileSrcSet,
}: HeroPreloadData) {
    const cloudinaryOrigin = "https://res.cloudinary.com";

    return (
        <>
        { heroVideoUrl && (
            <>
            <link
            rel= "preconnect"
    href = {cloudinaryOrigin}
    crossOrigin = ""
        />
        <link rel="dns-prefetch" href = {cloudinaryOrigin} />
            </>
      )
}
{
    heroPosterDesktop && (
        <link
          rel="preload"
    as = "image"
    href = { heroPosterDesktop }
    fetchPriority = "high"
    imageSrcSet = { heroPosterDesktopSrcSet }
    imageSizes = "100vw"
    media = "(min-width: 769px)"
        />
      )
}
{
    heroPosterMobile && (
        <link
          rel="preload"
    as = "image"
    href = { heroPosterMobile }
    fetchPriority = "high"
    imageSrcSet = { heroPosterMobileSrcSet }
    imageSizes = "100vw"
    media = "(max-width: 768px)"
        />
      )
}
</>
  );
}
