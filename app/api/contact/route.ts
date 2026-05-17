import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { getChannelFromEnv } from "@/lib/site-config";

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
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error: SANITY_API_WRITE_TOKEN missing" },
      { status: 500 }
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const name = sanitize(payload?.name);
  const email = sanitize(payload?.email);
  const company = sanitize(payload?.company);
  const message = sanitize(payload?.message);
  const language = sanitize(payload?.language) || "en";
  const channel = sanitize(payload?.channel) || getChannelFromEnv();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
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

    return NextResponse.json({ success: true, id: created._id });
  } catch (error) {
    console.error("Failed to save contact submission", error);
    return NextResponse.json(
      { error: "Failed to save contact submission." },
      { status: 500 }
    );
  }
}
