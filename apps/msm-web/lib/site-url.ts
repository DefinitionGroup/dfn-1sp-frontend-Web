import { getSiteConfig } from "@1sp/site-config";

export const MSM_CANONICAL_URL =
  getSiteConfig("msmWeb").domains.production || "https://www.msm.digital";
