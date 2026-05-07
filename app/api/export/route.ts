import { NextRequest, NextResponse } from "next/server";
import { exportDeckToPptx } from "@/lib/pptx";
import { DeckSchema } from "@/lib/types";

// POST /api/export - Accepts deck JSON and returns a PPTX binary for download
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const deck = DeckSchema.parse(body.deck);

    // exportDeckToPptx returns a base64 string
    const base64 = await exportDeckToPptx(deck);

    // Decode base64 to binary
    const binaryStr = Buffer.from(base64, "base64");

    const filename = deck.title.replace(/[^a-z0-9]/gi, "_") + ".pptx";
    return new NextResponse(binaryStr, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
