import Script from "next/script";
import { shouldLoadProductionTracking } from "@1sp/utils/deployment-tier";
import { COOKIEBOT_DECLARATION_SRC } from "@/lib/cookiebot";

export default function CookieDeclaration() {
  if (!shouldLoadProductionTracking()) return null;

  return (
    <div className="container mx-auto px-4 md:px-0 py-12">
      <Script
        id="CookieDeclaration"
        src={COOKIEBOT_DECLARATION_SRC}
        strategy="afterInteractive"
      />
    </div>
  );
}
