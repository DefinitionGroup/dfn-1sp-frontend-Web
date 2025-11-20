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
    const { _type, slug, language, channel } = body;

    console.log(`Revalidating content: ${_type} (${language}/${channel})`);

    // Revalidate based on document type
    switch (_type) {
        case "page":
            // Revalidate specific page if slug is available
            if (slug?.current && language) {
                revalidatePath(`/${language}/${slug.current}`);
                console.log(`Revalidated page: /${language}/${slug.current}`);
            }
            // Also revalidate the locale home page
            if (language) {
                revalidatePath(`/${language}`);
            }
            break;

        case "case":
            // Revalidate cases pages
            if (slug?.current && language) {
                revalidatePath(`/${language}/cases/${slug.current}`);
                console.log(`Revalidated case: /${language}/cases/${slug.current}`);
            }
            // Revalidate cases overview
            if (language) {
                revalidatePath(`/${language}/cases`);
            }
            break;

        case "person":
            // Revalidate people pages
            if (slug?.current && language) {
                revalidatePath(`/${language}/people/${slug.current}`);
                console.log(`Revalidated person: /${language}/people/${slug.current}`);
            }
            // Revalidate people overview
            if (language) {
                revalidatePath(`/${language}/people`);
            }
            break;

        case "service":
            // Revalidate service pages
            if (slug?.current && language) {
                revalidatePath(`/${language}/services/${slug.current}`);
                console.log(`Revalidated service: /${language}/services/${slug.current}`);
            }
            // Revalidate services overview
            if (language) {
                revalidatePath(`/${language}/services`);
            }
            break;

        case "serviceGroup":
            // Service groups affect multiple pages
            if (language) {
                revalidatePath(`/${language}/services`);
            }
            break;

        case "menu":
            // Menu changes affect all pages
            if (language) {
                revalidatePath(`/${language}`, "layout");
            }
            break;

        case "siteSettings":
        case "globalSettings":
            // Global changes - revalidate everything
            revalidatePath("/", "layout");
            console.log("Revalidated all pages (global settings changed)");
            break;

        default:
            // For any other document type, revalidate all pages of that language
            if (language) {
                revalidatePath(`/${language}`, "layout");
            } else {
                // If no language specified, revalidate everything
                revalidatePath("/", "layout");
            }
    }

    // Always revalidate the home page as many documents can affect it
    revalidatePath("/en");
    revalidatePath("/de");
}
