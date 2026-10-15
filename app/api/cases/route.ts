import { NextRequest, NextResponse } from "next/server";
import { getAllCases } from "@1sp/sanity-queries";
import { getChannelFromEnv, getSiteConfig, isKnownChannel } from "@1sp/site-config";

const sanitize = (value: string | null, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = sanitize(searchParams.get("channel"), getChannelFromEnv());
  const language = sanitize(searchParams.get("language"), "en");
  // Only known channels and their locales reach Sanity; arbitrary values would
  // each add an uncached query.
  if (!isKnownChannel(channel) || !(getSiteConfig(channel).locales as string[]).includes(language)) {
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
