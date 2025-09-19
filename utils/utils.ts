export const assetUrl = (a?: { secure_url?: string; url?: string } | null) =>
    a?.secure_url || a?.url || undefined;


import type { CTA, Link } from "@/types/sanity.types";
export const resolveLink = (link?: Link) => {
    if (!link) return "#";
    if (link.linkType === "internal") {
        // TODO: swap with your actual internal route builder
        const slug = (link.page as any)?.slug?.current || (link.page as any)?._ref || "";
        return slug ? `/${slug}` : "#";
    }
    return link.externalUrl || "#";
};


export const ctaToButtonProps = (cta?: CTA) => ({
    text: cta?.text || "",
    href: resolveLink(cta?.link),
    variant: (cta?.variant as any) || "default",
});