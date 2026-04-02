import Script from "next/script";
import { COOKIEBOT_BANNER_SRC, COOKIEBOT_CID } from "@/lib/cookiebot";

export default function CookiebotBanner() {
  return (
    <Script
      id="Cookiebot"
      src={COOKIEBOT_BANNER_SRC}
      data-cbid={COOKIEBOT_CID}
      data-blockingmode="auto"
      strategy="afterInteractive"
    />
  );
}
