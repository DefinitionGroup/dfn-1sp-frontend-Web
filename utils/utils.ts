export const assetUrl = (a?: { secure_url?: string; url?: string } | null) =>
    a?.secure_url || a?.url || undefined;


import type { CTA, Link } from "@/types/sanity.types";
export const resolveLink = (link?: Link) => {
    if (!link) return "#";
    if (link.linkType === "internal") {
        // Handle expanded page reference with slug
        const slug = (link.page as any)?.slug?.current || "";
        return slug ? `/${slug}` : "#";
    }
    return link.externalUrl || "#";
};


export const ctaToButtonProps = (cta?: CTA) => ({
    text: cta?.text || "",
    href: resolveLink(cta?.link),
    variant: (cta?.variant as any) || "default",
});