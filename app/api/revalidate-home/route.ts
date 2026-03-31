import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        revalidatePath("/", "layout");
        revalidatePath("/");

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            revalidatedPaths: ["/ (layout)", "/"],
            message: "Homepage caches cleared successfully.",
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
