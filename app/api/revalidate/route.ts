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

            await handleRevalidation(body);
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
            await handleRevalidation(body);
        }

        return NextResponse.json({
            success: true,
            revalidated: true,
            now: Date.now(),
            message: "Cache revalidated successfully",
        });
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

    console.log(`[Revalidate] Processing: ${_type}${slug?.current ? ` (${slug.current})` : ""} [${language || "all"}]`);

    // ==========================================================================
    // TAG-BASED REVALIDATION
    // ==========================================================================
    // Tags are more surgical than paths - they invalidate only fetches that
    // were tagged with that specific tag, regardless of which page they're on.

    switch (_type) {
        case "page":
            // Invalidate page-specific cache
            revalidateTag("pages");
            revalidatedTags.push("pages");

            if (slug?.current) {
                revalidateTag(`page:${slug.current}`);
                revalidatedTags.push(`page:${slug.current}`);
            }

            // Also invalidate path for this specific page
            if (slug?.current && language) {
                revalidatePath(`/${language}/${slug.current}`);
                revalidatedPaths.push(`/${language}/${slug.current}`);
            }
            break;

        case "case":
        case "caseStudy":
            // Case studies affect: their own page + nav overlay + any page showing cases
            revalidateTag("cases");
            revalidateTag("global"); // Cases appear in nav overlay
            revalidatedTags.push("cases", "global");

            if (slug?.current) {
                revalidateTag(`case:${slug.current}`);
                revalidatedTags.push(`case:${slug.current}`);

                if (language) {
                    revalidatePath(`/${language}/cases/${slug.current}`);
                    revalidatedPaths.push(`/${language}/cases/${slug.current}`);
                }
            }

            // Invalidate cases listing page
            if (language) {
                revalidatePath(`/${language}/cases`);
                revalidatedPaths.push(`/${language}/cases`);
            }
            break;

        case "person":
            // Team members appear on pages via PageBuilder components
            revalidateTag("people");
            revalidatedTags.push("people");

            if (slug?.current && language) {
                revalidatePath(`/${language}/people/${slug.current}`);
                revalidatedPaths.push(`/${language}/people/${slug.current}`);
            }
            break;

        case "service":
        case "services":
            // Services affect: their own page + nav overlay + any page showing services
            revalidateTag("services");
            revalidateTag("global"); // Services appear in nav overlay
            revalidatedTags.push("services", "global");

            if (language) {
                revalidatePath(`/${language}/services`);
                revalidatedPaths.push(`/${language}/services`);
            }
            break;

        case "serviceGroup":
            // Service groups affect service listings
            revalidateTag("services");
            revalidatedTags.push("services");

            if (language) {
                revalidatePath(`/${language}/services`);
                revalidatedPaths.push(`/${language}/services`);
            }
            break;

        case "menu":
            // Menu changes affect navigation across ALL pages
            // This is the one case where we need broad invalidation
            revalidateTag("global");
            revalidatedTags.push("global");

            // Also invalidate layout to refresh nav/footer everywhere
            if (language) {
                revalidatePath(`/${language}`, "layout");
                revalidatedPaths.push(`/${language} (layout)`);
            } else {
                revalidatePath("/", "layout");
                revalidatedPaths.push("/ (layout)");
            }
            break;

        case "siteSettings":
        case "globalSettings":
            // Global changes affect everything - this is the nuclear option
            revalidateTag("global");
            revalidateTag("pages");
            revalidateTag("cases");
            revalidateTag("services");
            revalidatedTags.push("global", "pages", "cases", "services");

            revalidatePath("/", "layout");
            revalidatedPaths.push("/ (layout)");
            break;

        case "unit":
            // Units appear in various components
            revalidateTag("units");
            revalidatedTags.push("units");
            break;

        case "client":
            // Clients are referenced in case studies
            revalidateTag("cases");
            revalidatedTags.push("cases");
            break;

        default:
            // For unknown document types, be conservative and invalidate pages
            revalidateTag("pages");
            revalidatedTags.push("pages");

            if (language) {
                revalidatePath(`/${language}`, "layout");
                revalidatedPaths.push(`/${language} (layout)`);
            }
    }

    // Log what was revalidated for debugging
    console.log(`[Revalidate] Tags: [${revalidatedTags.join(", ")}]`);
    if (revalidatedPaths.length > 0) {
        console.log(`[Revalidate] Paths: [${revalidatedPaths.join(", ")}]`);
    }
}
