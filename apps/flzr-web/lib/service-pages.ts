/** English pages supplied by the approved workbook; other services retain their modal. */
const SERVICE_PAGES: Record<string, string> = {
  "service-flzr-trainings-en": "trainings",
  "service-flzr-promotion-en": "promotion",
  "service-flzr-live-video-consulting-en": "video-consulting",
  "service-flzr-pos-management-en": "pos-management",
  "service-flzr-sales-force-en": "sales-force",
  "service-flzr-go-to-markets-en": "go-to-markets",
  "service-flzr-business-intelligence-en": "business-intelligence",
};

export function servicePageHref(id: string, locale: string): string | undefined {
  const slug = locale === "en" ? SERVICE_PAGES[id] : undefined;
  return slug ? `/en/${slug}` : undefined;
}
