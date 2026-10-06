import { shouldLoadProductionTracking } from "@1sp/utils/deployment-tier";
import { COOKIEBOT_BANNER_SRC, COOKIEBOT_CID } from "@msm/lib/cookiebot";

export default function CookiebotBanner({ language }: { language: string }) {
  if (!shouldLoadProductionTracking()) return null;

  // Cookiebot's automatic blocker must execute before hydration and tracking.
  // next/script defers execution; a synchronous head script preserves that order.
  return (
    // eslint-disable-next-line @next/next/no-sync-scripts
    <script
      id="Cookiebot"
      src={COOKIEBOT_BANNER_SRC}
      data-cbid={COOKIEBOT_CID}
      data-blockingmode="auto"
      data-culture={language.toUpperCase()}
      type="text/javascript"
    />
  );
}
