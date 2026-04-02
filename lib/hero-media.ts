import {
    cloudinaryPosterSrcSet,
    cloudinaryPosterUrl,
    optimizedPortraitVideoUrl,
    optimizedVideoUrl,
} from "@/utils/utils";

export interface HeroMediaVariant {
    id: "phone-portrait" | "phone-landscape" | "tablet" | "desktop";
    media: string;
    videoUrl: string | undefined;
    posterUrl: string | undefined;
    posterSrcSet: string | undefined;
    sizes: string;
}

export function getHeroMediaVariants(videoUrl?: string): HeroMediaVariant[] {
    return [
        {
            id: "phone-portrait",
            media: "(max-width: 767px) and (orientation: portrait)",
            videoUrl: optimizedPortraitVideoUrl(videoUrl, {
                maxWidth: 420,
                quality: "eco",
                aspectRatio: "9:16",
            }),
            posterUrl: cloudinaryPosterUrl(videoUrl, {
                maxWidth: 480,
                portrait: true,
                aspectRatio: "9:16",
            }),
            posterSrcSet: cloudinaryPosterSrcSet(videoUrl, [360, 420, 480, 640], {
                portrait: true,
                aspectRatio: "9:16",
            }),
            sizes: "100vw",
        },
        {
            id: "phone-landscape",
            media: "(max-width: 767px) and (orientation: landscape)",
            videoUrl: optimizedVideoUrl(videoUrl, {
                maxWidth: 960,
                quality: "eco",
                autoCodec: true,
                aspectRatio: "16:9",
            }),
            posterUrl: cloudinaryPosterUrl(videoUrl, {
                maxWidth: 960,
                aspectRatio: "16:9",
            }),
            posterSrcSet: cloudinaryPosterSrcSet(videoUrl, [640, 768, 960], {
                aspectRatio: "16:9",
            }),
            sizes: "100vw",
        },
        {
            id: "tablet",
            media: "(min-width: 768px) and (max-width: 1023px)",
            videoUrl: optimizedVideoUrl(videoUrl, {
                maxWidth: 1280,
                quality: "good",
                autoCodec: true,
            }),
            posterUrl: cloudinaryPosterUrl(videoUrl, { maxWidth: 1280 }),
            posterSrcSet: cloudinaryPosterSrcSet(videoUrl, [960, 1280, 1440]),
            sizes: "100vw",
        },
        {
            id: "desktop",
            media: "(min-width: 1024px)",
            videoUrl: optimizedVideoUrl(videoUrl, {
                maxWidth: 1600,
                quality: "auto",
                autoCodec: true,
            }),
            posterUrl: cloudinaryPosterUrl(videoUrl, { maxWidth: 1600 }),
            posterSrcSet: cloudinaryPosterSrcSet(videoUrl, [1280, 1600, 1920]),
            sizes: "100vw",
        },
    ];
}
