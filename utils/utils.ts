export const assetUrl = (a?: { secure_url?: string; url?: string } | null) =>
    a?.secure_url || a?.url || undefined;

/**
 * Optimizes a Cloudinary video URL by injecting transformation parameters.
 *
 * Transformations applied:
 * - `q_auto`  — intelligent quality compression (40-70% smaller files)
 * - `f_auto`  — best format per browser (WebM/VP9 for Chrome, HEVC for Safari, H.264 fallback)
 * - `ac_none` — strips audio track (saves ~20-30% for muted background videos)
 * - `w_{n}`   — optional max width for responsive delivery
 *
 * Only transforms Cloudinary `/upload/` URLs. Non-Cloudinary URLs are returned unchanged.
 *
 * @example
 * optimizedVideoUrl("https://res.cloudinary.com/.../upload/v123/video.mp4")
 * // → "https://res.cloudinary.com/.../upload/q_auto,f_auto,ac_none/v123/video.mp4"
 *
 * optimizedVideoUrl(url, { maxWidth: 1280, withAudio: true })
 * // → "https://res.cloudinary.com/.../upload/q_auto,f_auto,w_1280/v123/video.mp4"
 */
/**
 * Generates a poster image URL from a Cloudinary video URL.
 *
 * Cloudinary can extract a frame from any video by changing the file extension
 * to an image format (e.g., .jpg, .webp). We inject optimization transforms
 * and use `so_0` (first frame) or `so_auto` (AI-selected best frame).
 *
 * This is used for LCP optimization: showing a lightweight poster image
 * immediately while deferring the heavy video load.
 *
 * @example
 * cloudinaryPosterUrl("https://res.cloudinary.com/.../upload/v123/video.mp4")
 * // → "https://res.cloudinary.com/.../upload/q_auto,f_auto,so_0,w_1920/v123/video.jpg"
 *
 * cloudinaryPosterUrl(url, { maxWidth: 640, frame: "auto" })
 * // → "https://res.cloudinary.com/.../upload/q_auto,f_auto,so_auto,w_640/v123/video.jpg"
 */
export const cloudinaryPosterUrl = (
    url?: string,
    options?: {
        maxWidth?: number;
        frame?: "0" | "auto" | string;
        /** Crop poster to portrait (9:16) with AI subject detection */
        portrait?: boolean;
    }
): string | undefined => {
    if (!url) return undefined;

    // Only transform Cloudinary upload URLs
    if (!url.includes("/upload/")) return undefined;

    const frame = options?.frame ?? "0";
    const transforms = ["q_auto", "f_auto", `so_${frame}`];

    // Portrait mode — match the video crop
    if (options?.portrait) {
        transforms.push("c_fill", "g_auto", "ar_9:16");
    }

    if (options?.maxWidth) transforms.push(`w_${options.maxWidth}`);

    const transformStr = transforms.join(",");

    // Insert transforms and change extension to .jpg
    const withTransforms = url.replace(/\/upload\//, `/upload/${transformStr}/`);
    // Replace video extension with .jpg
    return withTransforms.replace(/\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i, ".jpg$2");
};

export const optimizedVideoUrl = (
    url?: string,
    options?: {
        maxWidth?: number;
        withAudio?: boolean;
        /**
         * Crop to portrait (9:16) for mobile.
         * Uses `c_fill,g_auto,ar_9:16` so Cloudinary AI-crops around the subject.
         */
        portrait?: boolean;
        /**
         * Quality tier:
         * - "auto"  — balanced (default)
         * - "eco"   — aggressive compression, great for background videos
         * - "good"  — slightly better than eco, still smaller than auto
         * - "best"  — highest quality, largest file
         */
        quality?: "auto" | "eco" | "good" | "best";
        /**
         * Use `vc_auto` to let Cloudinary pick the best video codec
         * (H.265/HEVC, VP9, AV1) per browser for maximum compression.
         * Default: true
         */
        autoCodec?: boolean;
    }
): string | undefined => {
    if (!url) return url;

    // Only transform Cloudinary upload URLs
    if (!url.includes("/upload/")) return url;

    const quality = options?.quality ?? "auto";
    const useAutoCodec = options?.autoCodec !== false;

    const transforms: string[] = [];

    // Quality — q_auto variants give Cloudinary control over compression level
    transforms.push(quality === "auto" ? "q_auto" : `q_auto:${quality}`);

    // Format — f_auto picks the best container format per browser
    transforms.push("f_auto");

    // Codec — vc_auto selects the most efficient codec (H.265, VP9, AV1)
    if (useAutoCodec) transforms.push("vc_auto");

    // Audio — strip for muted background videos
    if (!options?.withAudio) transforms.push("ac_none");

    // Portrait mode — crop to 9:16 with AI subject detection
    if (options?.portrait) {
        transforms.push("c_fill", "g_auto", "ar_9:16");
    }

    // Width constraint
    if (options?.maxWidth) transforms.push(`w_${options.maxWidth}`);

    const transformStr = transforms.join(",");

    // Insert transformations between /upload/ and the next path segment (e.g. v1234/)
    return url.replace(/\/upload\//, `/upload/${transformStr}/`);
};

/**
 * Convenience: generate a mobile-optimized portrait video URL.
 *
 * Applies:
 * - 9:16 aspect ratio (`ar_9:16`)
 * - AI subject-aware crop (`c_fill,g_auto`)
 * - Aggressive but high-quality compression (`q_auto:eco`)
 * - Best codec per browser (`vc_auto`)
 * - Format auto-selection (`f_auto`)
 * - Audio stripped (`ac_none`)
 *
 * @example
 * optimizedPortraitVideoUrl("https://res.cloudinary.com/.../upload/v123/hero.mp4")
 * // → "https://res.cloudinary.com/.../upload/q_auto:eco,f_auto,vc_auto,ac_none,c_fill,g_auto,ar_9:16,w_480/v123/hero.mp4"
 */
export const optimizedPortraitVideoUrl = (
    url?: string,
    options?: { maxWidth?: number; quality?: "auto" | "eco" | "good" | "best" }
): string | undefined =>
    optimizedVideoUrl(url, {
        portrait: true,
        maxWidth: options?.maxWidth ?? 480,
        quality: options?.quality ?? "eco",
        autoCodec: true,
    });


import type { CTA, Link } from "@/types/sanity.types";
import { client } from "@/sanity/lib/client";

export const resolveLink = (link?: Link | null) => {
    if (!link) return "";

    const linkType = (link as any).linkType || (link as any).type || "external";

    if (linkType === "internal") {
        const page = (link as any).page;
        let slug = "";

        if (typeof page === "string") {
            slug = page;
        } else if (page) {
            slug =
                (page as any)?.slug?.current ||
                (page as any)?.current ||
                (page as any)?.slug ||
                (page as any)?.url ||
                "";
        }

        slug = String(slug || "").trim();
        if (!slug) return "";
        return slug.startsWith("/") ? slug : `/${slug}`;
    }

    const external =
        (link as any).externalUrl ||
        (link as any).url ||
        (link as any).href ||
        (link as any).external ||
        "";

    return external || "";
};

export const resolveLinkAsync = async (link?: Link | null) => {
    if (!link) return "";

    const linkType = (link as any).linkType || (link as any).type || "external";

    if (linkType === "internal") {
        const page = (link as any).page;
        let slug = "";

        if (page && typeof page === "object" && page._ref && page._type === "reference") {
            try {
                const result = await client.fetch(
                    `*[_id == $ref][0].slug.current`,
                    { ref: page._ref }
                );
                slug = result || "";
            } catch (error) {
                console.error("Error fetching slug from Sanity:", error);
                return "";
            }
        } else if (typeof page === "string") {
            slug = page;
        } else if (page) {
            slug =
                (page as any)?.slug?.current ||
                (page as any)?.current ||
                (page as any)?.slug ||
                (page as any)?.url ||
                "";
        }

        slug = String(slug || "").trim();
        if (!slug) return "";
        return slug.startsWith("/") ? slug : `/${slug}`;
    }

    const external =
        (link as any).externalUrl ||
        (link as any).url ||
        (link as any).href ||
        (link as any).external ||
        "";

    return external || "";
};


export const ctaToButtonProps = (cta?: CTA) => ({
    text: cta?.text || "",
    href: resolveLink(cta?.link) || "#",
    variant: (cta?.variant as any) || "default",
});