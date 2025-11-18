import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        // Revalidate all paths
        revalidatePath("/", "layout");
        revalidatePath("/[locale]", "page");
        revalidatePath("/en", "page");
        revalidatePath("/de", "page");

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            message: "All caches cleared successfully. Please hard refresh your browser.",
        });
    } catch (err) {
        return NextResponse.json(
            {
                revalidated: false,
                error: String(err),
            },
            { status: 500 }
        );
    }
}
