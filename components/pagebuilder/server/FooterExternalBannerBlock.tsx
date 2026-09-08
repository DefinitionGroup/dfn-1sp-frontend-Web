import { getFooterExternalBannerUnits } from "@1sp/sanity-queries";
import type { FooterExternalBannerData } from "@1sp/sanity-types";
import FooterExternalBanner from "@/components/menu/footerExternalBanner";

export default async function FooterExternalBannerBlock({
  language = "en",
  ...data
}: FooterExternalBannerData & { language?: string }) {
  const units = await getFooterExternalBannerUnits("1spWeb", language);
  return <FooterExternalBanner data={data} units={units} language={language} />;
}
