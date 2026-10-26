import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

export const dynamic = "force-dynamic";

type Payload = { _type?: string; slug?: { current?: string } };

// Cache tags used by lib/queries.ts, by document type.
const TAGS: Record<string, (slug?: string) => string[]> = {
  page: (slug) => ["pages", ...(slug ? [`page:${slug}`] : [])],
  caseStudy: (slug) => ["cases", ...(slug ? [`case:${slug}`] : [])],
  // Clients and services appear on case cards and pages.
  client: () => ["cases"],
  services: () => ["cases"],
  siteSettings: () => ["global"],
};

/** Signed publish notifications from the revalidate-sites Sanity Function (or a webhook). */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "Revalidation is not configured" }, { status: 500 });

  const { body, isValidSignature } = await parseBody<Payload>(request, secret);
  if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  if (!body?._type) return NextResponse.json({ message: "Missing document type" }, { status: 400 });

  const tags = ["sanity", ...(TAGS[body._type]?.(body.slug?.current) ?? [])];
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tags, now: Date.now() });
}
