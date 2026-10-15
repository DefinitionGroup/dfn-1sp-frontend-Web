import type { CloudinaryAsset } from "@1sp/sanity-types";

export type OriginsLogo = {
  _key?: string;
  name?: string;
  image?: CloudinaryAsset;
  imageUrl?: string;
};

/** Saved order is authoritative, including an intentionally empty grid. */
export function getOriginsLogos(logos?: OriginsLogo[] | null) {
  return (Array.isArray(logos) ? logos : []).flatMap((logo, index) => {
    const src = (logo?.image?.secure_url || logo?.image?.url || logo?.imageUrl || "").trim();
    const alt = logo?.name?.trim();
    if (!alt || !(/^(https:\/\/|\/(?!\/))/.test(src))) return [];
    return [{ key: logo._key || `${src}-${index}`, src, alt }];
  });
}
