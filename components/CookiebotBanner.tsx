import { COOKIEBOT_BANNER_SRC, COOKIEBOT_CID } from "@/lib/cookiebot";

export default function CookiebotBanner() {
  return (
    // Cookiebot requires this banner script to be inserted synchronously in <head>.
    // eslint-disable-next-line @next/next/no-sync-scripts
    <script
      id="Cookiebot"
      src={COOKIEBOT_BANNER_SRC}
      data-cbid={COOKIEBOT_CID}
      data-blockingmode="auto"
      type="text/javascript"
    />
  );
}
