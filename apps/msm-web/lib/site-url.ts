import { getSiteConfig } from "@1sp/site-config";
import { isTestDeployment } from "@1sp/utils/deployment-tier";

export const MSM_CANONICAL_URL =
  isTestDeployment("msm")
    ? (process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`).replace(/\/$/, "")
    : getSiteConfig("msmWeb").domains.production || "https://www.msm.digital";

export const msmPath = (language: string, path: string) =>
  `${language === 'en' ? '' : `/${language}`}/${path.replace(/^\//, '')}`;
