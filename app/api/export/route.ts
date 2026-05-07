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

    // Generate PPTX as Uint8Array
    const uint8 = await exportDeckToPptx(deck);

    // Return as binary response
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${deck.title.replace(/[^a-z0-9]/gi, '_')}.pptx"`,
        "Content-Length": uint8.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export presentation", details: String(error) },
      { status: 500 }
    );
  }
}
