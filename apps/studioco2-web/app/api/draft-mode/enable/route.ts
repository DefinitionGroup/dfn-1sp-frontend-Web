import type { NextRequest } from "next/server";
import { client } from "@1sp/sanity-queries/client";
import { requireViewerToken } from "@1sp/sanity-queries/token";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

// The viewer token is read per request, so builds without it (local) still succeed.
export async function GET(request: NextRequest) {
  const { GET: enable } = defineEnableDraftMode({ client: client.withConfig({ token: requireViewerToken() }) });
  return enable(request);
}
