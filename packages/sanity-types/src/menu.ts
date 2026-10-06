import type { FooterExternalBannerData } from "./footerExternalBanner";
// Menu types for Sanity data
export interface MenuItem {
    _key: string;
    slug?: string;
    route?: string;
    title?: string;
    displayName?: string;
}

export interface NavbarMenu {
    _id?: string;
    title?: string;
    menuType: "Navbar";
    imageCloud?: {
        secure_url?: string;
    };
    logoUrl?: string;
    oneSpMembershipLabel?: string;
    menuItems?: MenuItem[];
}

export interface FooterLink {
    _key: string;
    linkType: "internal" | "external";
    isCaseLink?: boolean;
    slug?: string;
    pageTitle?: string;
    case?: {
        slug?: {
            current: string;
        };
    };
    externalUrl?: string;
    displayName?: string;
}

/** Where a footer column gets its links from. Unset means "manual". */
export type FooterColumnSource = "manual" | "cases" | "services" | "pages";

export interface FooterColumn {
    _key?: string;
    title?: string;
    source?: FooterColumnSource | null;
    limit?: number | null;
    links?: FooterLink[];
}

export interface SocialLink {
    _key?: string;
    icon?: {
        secure_url?: string;
    };
    name?: string;
    url?: string;
}

export interface FooterMenu {
    footerExternalBanner?: FooterExternalBannerData | null;
    renaissanceLegalText?: string;
    _id?: string;
    title?: string;
    menuType: "Footer";
    imageCloud?: {
        secure_url?: string;
    };
    logoUrl?: string;
    addressTitle?: string;
    locations?: {
        _key: string;
        name?: string;
        address?: string;
    }[];
    footerColumns?: FooterColumn[];
    socialLinks?: SocialLink[];
    copyright?: string;
}
