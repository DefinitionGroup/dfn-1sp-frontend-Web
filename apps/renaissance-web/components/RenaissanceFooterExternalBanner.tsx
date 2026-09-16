import localFont from "next/font/local";
import type { CSSProperties } from "react";
import type { FooterExternalBannerData } from "@1sp/sanity-types";
import { getFooterExternalBannerUnits } from "@1sp/sanity-queries";
import { resolveCtaLink } from "@1sp/utils/cta";
import OneSpScope from "@/components/onesp-group/OneSpScope";
import FooterExternalBanner from "@/components/menu/footerExternalBanner";

const networkFont = localFont({ src: "../app/fonts/AspektaVF.woff2", display: "swap" });

/** The 1SP network banner keeps its own branding and unit catalog inside Renaissance. */
export default async function RenaissanceFooterExternalBanner({
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
    // These references belong to 1SP, not to the host Renaissance website.
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
    <div style={{ "--font-aspekta": networkFont.style.fontFamily } as CSSProperties}>
    <OneSpScope fullWidth>
      <FooterExternalBanner data={data} units={linkedUnits} language={language}
        hostLogo={{ src: "/units/RENAISSANCE/renaissance-horz_logo.svg", alt: "Renaissance" }} />
    </OneSpScope>
    </div>
  );
}
