import type { CloudinaryAsset, CTA } from "./index";

export interface FooterExternalBannerData {
  _type?: "footerExternalBanner";
  _key?: string;
  eyebrow?: string;
  logo?: CloudinaryAsset;
  logoAlt?: string;
  text?: string;
  video?: CloudinaryAsset;
  poster?: CloudinaryAsset;
  cta?: CTA;
  copyright?: string;
}

export interface FooterExternalBannerUnit {
  _id: string;
  name?: string;
  logo?: CloudinaryAsset;
  logoColor?: CloudinaryAsset;
  cta?: CTA;
}
