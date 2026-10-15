import type { CloudinaryAsset, CTA } from "./index";

export interface FooterExternalBannerData {
  _type?: "footerExternalBanner";
  _key?: string;
  eyebrow?: string;
  logo?: CloudinaryAsset;
  logoAlt?: string;
  headline?: string;
  text?: string;
  video?: CloudinaryAsset;
  poster?: CloudinaryAsset;
  /** Unit references in editor order; queries spread them raw, so only `_ref` is set. */
  unitOrder?: Array<{ _key?: string; _ref?: string }> | null;
  cta?: CTA;
  copyright?: string;
}

export interface FooterExternalBannerUnit {
  _id: string;
  name?: string;
  tagline?: string;
  footerBannerLabel?: string;
  backgroundImage?: CloudinaryAsset;
  footerHoverVideo?: CloudinaryAsset;
  footerBannerLogo?: CloudinaryAsset;
  logo?: CloudinaryAsset;
  logoColor?: CloudinaryAsset;
  cta?: CTA;
}
