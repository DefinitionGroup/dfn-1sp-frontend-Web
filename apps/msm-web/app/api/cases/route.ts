import { NextRequest, NextResponse } from "next/server";
import { getAllCases } from "@1sp/sanity-queries";
import { getSiteConfig } from "@1sp/site-config";

const CHANNEL = "msmWeb";
const LOCALES = new Set<string>(getSiteConfig(CHANNEL).locales);

const sanitize = (value: string | null, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = sanitize(searchParams.get("channel"), CHANNEL);
  const language = sanitize(searchParams.get("language"), "en");
  // Only this site's own values reach Sanity; arbitrary ones would each add
  // an uncached query.
  if (channel !== CHANNEL || !LOCALES.has(language)) {
    return NextResponse.json({ error: "Unknown channel or language." }, { status: 400 });
  }

  try {
    const caseStudies = await getAllCases(channel, language);

    return NextResponse.json(
      { caseStudies },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch case studies", error);
    return NextResponse.json(
      { error: "Failed to fetch case studies." },
      { status: 500 }
    );
  }
}
