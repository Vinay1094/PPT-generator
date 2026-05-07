import { NextRequest, NextResponse } from "next/server";
import { exportToPptx } from "@/lib/pptx";
import { DeckSchema } from "@/lib/types";

// POST /api/export
// Accepts a deck JSON and returns a PPTX file for download
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the deck
    const deck = DeckSchema.parse(body.deck);

    // Generate PPTX using pptxgenjs
    const pres = exportToPptx(deck);

    // Get the binary data
    const buffer = await pres.writeFile({ outputType: "nodebuffer" });

    // Return as a downloadable blob
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${deck.title.replace(/\s+/g, "_")}.pptx"`,
      },
    });
  } catch (error: any) {
    const isZodError = error?.name === "ZodError";
    return NextResponse.json(
      {
        success: false,
        error: isZodError
          ? "Invalid deck format. Cannot export."
          : error?.message || "Export failed",
        details: isZodError ? error?.issues : undefined,
      },
      { status: isZodError ? 400 : 500 }
    );
  }
}
