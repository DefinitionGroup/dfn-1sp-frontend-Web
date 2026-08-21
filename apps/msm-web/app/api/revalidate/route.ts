/**
 * Sanity Revalidation Webhook Handler
 * ====================================
 *
 * This endpoint receives webhooks from Sanity when content changes,
 * and invalidates the appropriate cached data.
 *
 * ## How Revalidation Works in Next.js
 *
 * Next.js has two main revalidation strategies:
 *
 * ### 1. Path-based (`revalidatePath`)
 * - Invalidates a specific URL
 * - Good for: "The /en/about page changed"
 * - Limitation: Doesn't invalidate shared data used across multiple pages
 *
 * ### 2. Tag-based (`revalidateTag`)
 * - Invalidates all cached fetches with a specific tag
 * - Good for: "All data tagged 'global' should be refreshed"
 * - Benefits: More surgical, works for shared data
 *
 * ## Our Tag Strategy
 *
 * | Tag | What it covers |
 * |-----|----------------|
 * | `global` | Nav, footer, cases for nav, services for nav |
 * | `pages` | All page content |
 * | `page:${slug}` | Specific page by slug |
 * | `cases` | All case study content |
 * | `case:${slug}` | Specific case study |
 * | `services` | All services |
 * | `msmUnits` | MSM Unit overview, detail pages, and reverse Case attribution |
 *
 * ## Performance Optimization (January 2026)
 *
 * Changed from broad `revalidatePath("/", "layout")` calls to
 * targeted `revalidateTag()` calls for better performance.
 */
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export const dynamic = "force-dynamic";

// Define the expected webhook payload structure
interface SanityWebhookBody {
    _type: string;
    _id: string;
    slug?: {
        current?: string;
    };
    language?: string;
    channel?: string;
}

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.SANITY_REVALIDATE_SECRET;

        // Verify the secret token
        if (!secret) {
            console.error("Missing SANITY_REVALIDATE_SECRET environment variable");
            return NextResponse.json(
                { success: false, message: "Configuration error" },
                { status: 500 }
            );
        }

        const signature = req.headers.get("sanity-webhook-signature");

        // If signature is provided, verify it (recommended for production)
        if (signature) {
            // For signature validation, you can use the parseBody from next-sanity
            // This ensures the request actually came from Sanity
            const { body, isValidSignature } = await parseBody<SanityWebhookBody>(
                req,
                secret
            );

            if (!isValidSignature) {
                return NextResponse.json(
                    { success: false, message: "Invalid signature" },
                    { status: 401 }
                );
            }

            if (!body || !body._type) {
                return NextResponse.json(
                    { success: false, message: "Invalid webhook payload" },
                    { status: 400 }
                );
            }

            const result = await handleRevalidation(body);

            return NextResponse.json({
                success: true,
                revalidated: true,
                now: Date.now(),
                message: "Cache revalidated successfully",
                ...result,
            });
        } else {
            // Fallback: check for secret in query or body (less secure)
            const { searchParams } = new URL(req.url);
            const token = searchParams.get("secret");

            if (token !== secret) {
                return NextResponse.json(
                    { success: false, message: "Invalid token" },
                    { status: 401 }
                );
            }

            const body = (await req.json()) as SanityWebhookBody;
            const result = await handleRevalidation(body);

            return NextResponse.json({
                success: true,
                revalidated: true,
                now: Date.now(),
                message: "Cache revalidated successfully",
                ...result,
            });
        }
    } catch (err) {
        console.error("Error in revalidate webhook:", err);
        return NextResponse.json(
            {
                success: false,
                message: err instanceof Error ? err.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

async function handleRevalidation(body: SanityWebhookBody) {
    const { _type, slug, language } = body;
    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];
    const pushPath = (path: string, type?: "layout" | "page") => {
        revalidatePath(path, type);
        revalidatedPaths.push(type ? `${path} (${type})` : path);
    };

    console.log(`[Revalidate] Processing: ${_type}${slug?.current ? ` (${slug.current})` : ""} [${language || "all"}]`);

    /**
     * All `sanityFetch()` calls from `next-sanity/live` are cached with the
     * shared `sanity` tag in production. Without invalidating that base tag,
     * referenced content changes (for example `unit` data inside a page query)
     * can remain stale indefinitely on Vercel even though Studio/local dev
     * already shows the new content.
     */
    revalidateTag("sanity", "max");
    revalidatedTags.push("sanity");

    // ==========================================================================
    // TAG-BASED REVALIDATION
    // ==========================================================================
    // Tags are more surgical than paths - they invalidate only fetches that
    // were tagged with that specific tag, regardless of which page they're on.

    switch (_type) {
        case "oneSpComponentGroup":
            // A reusable group can be referenced by pages in every frontend.
            revalidateTag("pages", "max");
            revalidatedTags.push("pages");
            pushPath("/", "layout");
            break;

        case "page":
            // Invalidate page-specific cache
            revalidateTag("pages", "max");
            revalidatedTags.push("pages");

            if (slug?.current) {
                revalidateTag(`page:${slug.current}`, "max");
                revalidatedTags.push(`page:${slug.current}`);
            }

            // Also invalidate path for this specific page
            if (slug?.current) {
                pushPath(`/${slug.current}`);
            }
            break;

        case "case":
        case "caseStudy":
            // Case studies affect: their own page + nav overlay + any page showing cases
            revalidateTag("cases", "max");
            revalidateTag("global", "max"); // Cases appear in nav overlay
            revalidatedTags.push("cases", "global");

            if (slug?.current) {
                revalidateTag(`case:${slug.current}`, "max");
                revalidatedTags.push(`case:${slug.current}`);

                pushPath(`/cases/${slug.current}`);
            }

            // Invalidate cases listing page
            pushPath("/cases");
            break;

        case "person":
            // Team members appear on pages via PageBuilder components
            revalidateTag("people", "max");
            revalidatedTags.push("people");

            if (slug?.current) {
                pushPath(`/people/${slug.current}`);
            }
            break;

        case "service":
        case "services":
            // Services affect: their own page + nav overlay + any page showing services
            revalidateTag("services", "max");
            revalidateTag("pages", "max");
            revalidateTag("global", "max"); // Services appear in nav overlay
            revalidatedTags.push("services", "pages", "global");

            pushPath("/services");
            break;

        case "serviceGroup":
            // Service groups affect service listings
            revalidateTag("services", "max");
            revalidateTag("pages", "max");
            revalidatedTags.push("services", "pages");

            pushPath("/services");
            break;

        case "menu":
            // Menu changes affect navigation across ALL pages
            // This is the one case where we need broad invalidation
            revalidateTag("global", "max");
            revalidatedTags.push("global");

            // Also invalidate layout to refresh nav/footer everywhere
            pushPath("/", "layout");
            break;

        case "siteSettings":
        case "globalSettings":
            // Global changes affect everything - this is the nuclear option
            revalidateTag("global", "max");
            revalidateTag("pages", "max");
            revalidateTag("cases", "max");
            revalidateTag("services", "max");
            revalidatedTags.push("global", "pages", "cases", "services");

            pushPath("/", "layout");
            break;

        case "unit":
            // Units appear in various components
            revalidateTag("units", "max");
            revalidatedTags.push("units");
            break;

        case "msmUnit":
            // MSM Units own Case and Person relationships, so one edit affects
            // Unit pages, the overview, and reverse attribution on Case views.
            revalidateTag("msmUnits", "max");
            revalidateTag("cases", "max");
            revalidateTag("pages", "max");
            revalidatedTags.push("msmUnits", "cases", "pages");

            pushPath("/units");
            pushPath("/cases");
            if (slug?.current) {
                revalidateTag(`msmUnit:${slug.current}`, "max");
                revalidatedTags.push(`msmUnit:${slug.current}`);
                pushPath(`/units/${slug.current}`);
            }
            break;

        case "client":
            // Clients are referenced in case studies
            revalidateTag("cases", "max");
            revalidatedTags.push("cases");
            break;

        default:
            // For unknown document types, be conservative and invalidate pages
            revalidateTag("pages", "max");
            revalidatedTags.push("pages");

            pushPath("/", "layout");
    }

    // Log what was revalidated for debugging
    console.log(`[Revalidate] Tags: [${revalidatedTags.join(", ")}]`);
    if (revalidatedPaths.length > 0) {
        console.log(`[Revalidate] Paths: [${revalidatedPaths.join(", ")}]`);
    }

    return { revalidatedTags, revalidatedPaths };
}
