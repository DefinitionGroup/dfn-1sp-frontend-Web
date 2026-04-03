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
                maxWidth: 360,
                quality: "eco",
                aspectRatio: "9:16",
                duration: 8,
            }),
            posterUrl: cloudinaryPosterUrl(videoUrl, {
                maxWidth: 360,
                portrait: true,
                aspectRatio: "9:16",
            }),
            posterSrcSet: cloudinaryPosterSrcSet(videoUrl, [320, 360, 420, 480], {
                portrait: true,
                aspectRatio: "9:16",
            }),
            sizes: "100vw",
        },
        {
            id: "phone-landscape",
            media: "(max-width: 767px) and (orientation: landscape)",
            videoUrl: optimizedVideoUrl(videoUrl, {
                maxWidth: 768,
                quality: "eco",
                autoCodec: true,
                aspectRatio: "16:9",
                duration: 8,
            }),
            posterUrl: cloudinaryPosterUrl(videoUrl, {
                maxWidth: 768,
                aspectRatio: "16:9",
            }),
            posterSrcSet: cloudinaryPosterSrcSet(videoUrl, [480, 640, 768], {
                aspectRatio: "16:9",
            }),
            sizes: "100vw",
        },
        {
            id: "tablet",
            media: "(min-width: 768px) and (max-width: 1023px)",
            videoUrl: optimizedVideoUrl(videoUrl, {
                maxWidth: 1024,
                quality: "good",
                autoCodec: true,
                duration: 8,
            }),
            posterUrl: cloudinaryPosterUrl(videoUrl, { maxWidth: 1024 }),
            posterSrcSet: cloudinaryPosterSrcSet(videoUrl, [768, 960, 1024]),
            sizes: "100vw",
        },
        {
            id: "desktop",
            media: "(min-width: 1024px)",
            videoUrl: optimizedVideoUrl(videoUrl, {
                maxWidth: 1280,
                quality: "good",
                autoCodec: true,
                duration: 8,
            }),
            posterUrl: cloudinaryPosterUrl(videoUrl, {
                maxWidth: 1280,
                quality: "eco",
                sensitive: true,
            }),
            posterSrcSet: cloudinaryPosterSrcSet(videoUrl, [960, 1280], {
                quality: "eco",
                sensitive: true,
            }),
            sizes: "100vw",
        },
    ];
}
