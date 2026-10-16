"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Cookiebot?: {
      consent?: {
        statistics?: boolean;
      };
    };
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface GoogleAnalyticsConsentProps {
  measurementId: string;
}

const GTAG_SCRIPT_ID = "google-gtag-script";

export default function GoogleAnalyticsConsent({
  measurementId,
}: GoogleAnalyticsConsentProps) {
  useEffect(() => {
    const initializeAnalytics = () => {
      if (!window.Cookiebot?.consent?.statistics) return;
      if (document.getElementById(GTAG_SCRIPT_ID)) return;

      window.dataLayer = window.dataLayer || [];
      // gtag.js only processes Arguments objects. A rest-parameter array is
      // silently ignored, so `config` never runs and no _ga cookie is set.
      window.gtag =
        window.gtag ||
        function gtag() {
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer?.push(arguments);
        };

      window.gtag("js", new Date());
      window.gtag("config", measurementId);

      const script = document.createElement("script");
      script.id = GTAG_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    };

    const handleConsentReady = () => {
      initializeAnalytics();
    };

    window.addEventListener("CookiebotOnConsentReady", handleConsentReady);
    window.addEventListener("CookiebotOnAccept", handleConsentReady);

    handleConsentReady();

    return () => {
      window.removeEventListener("CookiebotOnConsentReady", handleConsentReady);
      window.removeEventListener("CookiebotOnAccept", handleConsentReady);
    };
  }, [measurementId]);

  return null;
}
