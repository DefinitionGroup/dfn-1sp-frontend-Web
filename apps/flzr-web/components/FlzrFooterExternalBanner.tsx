import type { FooterExternalBannerData } from "@1sp/sanity-types";
import { getFooterExternalBannerUnits } from "@1sp/sanity-queries";
import { resolveCtaLink } from "@1sp/utils/cta";
import OneSpScope from "@/components/onesp-group/OneSpScope";
import FooterExternalBanner from "@/components/menu/footerExternalBanner";

/** The 1SP network banner keeps its own branding and unit catalog inside FLZR. */
export default async function FlzrFooterExternalBanner({
  data,
  language,
}: {
  data: FooterExternalBannerData;
  language: string;
}) {
  const units = await getFooterExternalBannerUnits("1spWeb", language);
  const linkedUnits = units.map((unit) => {
    const href = resolveCtaLink(unit.cta?.link);
    if (!href.startsWith("/") || href.startsWith("//")) return unit;
    // These references belong to 1SP, not to the host FLZR website.
    const destination = href === "/home" ? "/" : href;
    return {
      ...unit,
      cta: {
        ...unit.cta,
        link: {
          linkType: "external" as const,
          externalUrl: new URL(destination, "https://www.1sp.agency").href,
        },
      },
    };
  });
  return (
    <OneSpScope fullWidth>
      <FooterExternalBanner data={data} units={linkedUnits} language={language} />
    </OneSpScope>
  );
}
