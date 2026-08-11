import Script from "next/script";
import { shouldLoadProductionTracking } from "@1sp/utils/deployment-tier";
import { COOKIEBOT_BANNER_SRC, COOKIEBOT_CID } from "@renaissance/lib/cookiebot";

export default function CookiebotBanner() {
  if (!shouldLoadProductionTracking()) return null;

  return (
    <Script
      id="Cookiebot"
      src={COOKIEBOT_BANNER_SRC}
      data-cbid={COOKIEBOT_CID}
      strategy="afterInteractive"
    />
  );
}
