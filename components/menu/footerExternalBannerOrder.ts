import type { FooterExternalBannerData, FooterExternalBannerUnit } from "@1sp/sanity-types";

/** Shared by the banner component and its HTML export (lib/footer-banner-export.ts). */
export function orderFooterBannerUnits(units: FooterExternalBannerUnit[], order: FooterExternalBannerData["unitOrder"]) {
  const refs = (order ?? []).map((ref) => ref?._ref);
  if (!refs.some(Boolean)) return units;
  const rank = (unit: FooterExternalBannerUnit) => {
    const index = refs.indexOf(unit._id);
    return index === -1 ? refs.length : index;
  };
  // The sort is stable, so unlisted units keep the query's A–Z order after the listed ones.
  return [...units].sort((a, b) => rank(a) - rank(b));
}
