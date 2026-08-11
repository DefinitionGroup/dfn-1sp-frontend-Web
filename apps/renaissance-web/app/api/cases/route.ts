import { NextRequest, NextResponse } from "next/server";
import { getAllCases } from "@1sp/sanity-queries";

const sanitize = (value: string | null, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = sanitize(searchParams.get("channel"), "renaissanceWeb");
  const language = sanitize(searchParams.get("language"), "en");

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
