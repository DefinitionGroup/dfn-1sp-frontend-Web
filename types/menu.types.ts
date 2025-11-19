// Menu types for Sanity data
export interface MenuItem {
    _key: string;
    slug?: string;
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

export interface FooterColumn {
    _key?: string;
    title?: string;
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
