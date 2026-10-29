import { getFooterExportGroup, getFooterExternalBannerUnits } from "@1sp/sanity-queries";
import {
  FOOTER_EXPORT_FILES,
  FOOTER_EXPORTS,
  parseFooterExportFile,
  renderFooterBannerPreview,
  renderFooterBannerSnippet,
} from "@/lib/footer-banner-export";

/**
 * /1spfooter/<file>: the 1SP footer banner as an HTML snippet for other sites'
 * CMSes (lib/footer-banner-export.ts). Middleware rewrites the locale-free URL
 * to this /en route. Built statically from the published 1SP Component Group
 * and units; every Sanity publish expires it through /api/revalidate, so the
 * first request after a change gets a fresh build, no deploy needed.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return FOOTER_EXPORT_FILES.map((file) => ({ locale: "en", file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; file: string }> }) {
  const { file } = await params;
  const parsed = parseFooterExportFile(file);
  if (!parsed) return new Response("Not found", { status: 404 });

  const { groupId, language } = FOOTER_EXPORTS[parsed.name];
  const group = await getFooterExportGroup(groupId);
  const units = group?.banner ? await getFooterExternalBannerUnits("1spWeb", group.language || language) : [];
  const snippet = renderFooterBannerSnippet({ name: parsed.name, group, units });
  const body = parsed.preview ? renderFooterBannerPreview(parsed.name, snippet) : snippet;

  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "access-control-allow-origin": "*",
      "x-robots-tag": "noindex",
    },
  });
}
