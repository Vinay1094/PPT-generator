import { NextRequest, NextResponse } from "next/server";
import { exportDeckToPptx } from "@/lib/pptx";
import { DeckSchema } from "@/lib/types";

// POST /api/export
// Accepts a deck JSON and returns a PPTX file for download
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the deck
    const deck = DeckSchema.parse(body.deck);

    // Generate PPTX blob
    const blob = await exportDeckToPptx(deck);
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${deck.title.replace(/\s+/g, "-")}.pptx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
