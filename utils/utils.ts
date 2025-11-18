export const assetUrl = (a?: { secure_url?: string; url?: string } | null) =>
    a?.secure_url || a?.url || undefined;


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