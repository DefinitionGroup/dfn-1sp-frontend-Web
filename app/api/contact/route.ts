import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@1sp/sanity-queries/env";
import { getChannelFromEnv, SITE_CONFIGS } from "@1sp/site-config";
import {
  anonymizedRateLimitKey,
  checkFixedWindowRateLimit,
  getRequestAddress,
} from "@1sp/utils/server/request-security";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const sanitize = (value: unknown): string | undefined =>
  typeof value === "string" ? value.trim() : undefined;

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request payload is too large." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rateLimit = checkFixedWindowRateLimit(
    anonymizedRateLimitKey("contact", getRequestAddress(req.headers)),
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_MS,
  );
  const responseHeaders = {
    "Cache-Control": "no-store",
    "X-RateLimit-Remaining": String(rateLimit.remaining),
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          ...responseHeaders,
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error: SANITY_API_WRITE_TOKEN missing" },
      { status: 503, headers: responseHeaders },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400, headers: responseHeaders },
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400, headers: responseHeaders },
    );
  }

  const fields = payload as Record<string, unknown>;
  if (sanitize(fields.website)) {
    return NextResponse.json({ success: true }, { headers: responseHeaders });
  }

  const name = sanitize(fields.name);
  const email = sanitize(fields.email);
  const company = sanitize(fields.company);
  const message = sanitize(fields.message);
  const channel = getChannelFromEnv();
  const siteConfig = SITE_CONFIGS[channel];
  const requestedLanguage = sanitize(fields.language);
  const language =
    siteConfig.locales.find((locale) => locale === requestedLanguage) ??
    siteConfig.defaultLocale;

  if (
    !name ||
    !email ||
    !message ||
    name.length > 120 ||
    email.length > 254 ||
    (company?.length ?? 0) > 160 ||
    message.length > 5_000
  ) {
    return NextResponse.json(
      { error: "Please check the submitted fields and their length." },
      { status: 400, headers: responseHeaders },
    );
  }

  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const created = await writeClient.create({
      _type: "contactSubmission",
      name,
      email,
      company,
      message,
      language,
      channel,
      status: "new",
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: Boolean(created._id) },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error("Failed to save contact submission", error);
    return NextResponse.json(
      { error: "Failed to save contact submission." },
      { status: 500, headers: responseHeaders },
    );
  }
}
