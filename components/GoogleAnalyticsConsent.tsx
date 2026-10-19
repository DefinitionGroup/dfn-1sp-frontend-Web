"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Cookiebot?: {
      consent?: {
        statistics?: boolean;
        marketing?: boolean;
      };
    };
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [gaDisableKey: `ga-disable-${string}`]: boolean | undefined;
  }
}

interface GoogleAnalyticsConsentProps {
  measurementId: string;
}

type ConsentValue = "granted" | "denied";

const GTAG_SCRIPT_ID = "google-gtag-script";

// Google Consent Mode v2 state derived from Cookiebot. Statistics consent
// loads GA; Google Signals and the ads endpoints (stats.g.doubleclick.net,
// ga-audiences) follow ad_storage and therefore wait for marketing consent.
function getConsentState() {
  const consent = window.Cookiebot?.consent;
  const analytics: ConsentValue = consent?.statistics ? "granted" : "denied";
  const ads: ConsentValue = consent?.marketing ? "granted" : "denied";

  return {
    analytics_storage: analytics,
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  };
}

export default function GoogleAnalyticsConsent({
  measurementId,
}: GoogleAnalyticsConsentProps) {
  useEffect(() => {
    const gaDisableKey = `ga-disable-${measurementId}` as const;

    const syncConsent = () => {
      const hasStatisticsConsent = Boolean(
        window.Cookiebot?.consent?.statistics,
      );

      if (document.getElementById(GTAG_SCRIPT_ID)) {
        // GA is already loaded, so apply the changed choice without a reload.
        // ga-disable also stops cookieless pings once statistics consent is
        // withdrawn, which analytics_storage: "denied" alone would still send.
        window[gaDisableKey] = !hasStatisticsConsent;
        window.gtag?.("consent", "update", getConsentState());
        return;
      }

      if (!hasStatisticsConsent) return;

      window.dataLayer = window.dataLayer || [];
      // gtag.js only processes Arguments objects. A rest-parameter array is
      // silently ignored, so `config` never runs and no _ga cookie is set.
      window.gtag =
        window.gtag ||
        function gtag() {
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer?.push(arguments);
        };

      // The consent default must precede `config` so the first hit already
      // respects the visitor's marketing choice.
      window.gtag("consent", "default", getConsentState());
      window.gtag("js", new Date());
      window.gtag("config", measurementId);

      const script = document.createElement("script");
      script.id = GTAG_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    };

    window.addEventListener("CookiebotOnConsentReady", syncConsent);
    window.addEventListener("CookiebotOnAccept", syncConsent);
    window.addEventListener("CookiebotOnDecline", syncConsent);

    syncConsent();

    return () => {
      window.removeEventListener("CookiebotOnConsentReady", syncConsent);
      window.removeEventListener("CookiebotOnAccept", syncConsent);
      window.removeEventListener("CookiebotOnDecline", syncConsent);
    };
  }, [measurementId]);

  return null;
}
