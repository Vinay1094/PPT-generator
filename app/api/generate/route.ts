import { NextRequest, NextResponse } from "next/server";
import { runResearchFirstPipeline } from "@/lib/agents";
import { GenerateDeckRequestSchema } from "@/lib/types";

// POST /api/generate
// Returns a Deck object directly (no wrapper) so page.tsx can use it as-is
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = GenerateDeckRequestSchema.parse(body);
    const deck = runResearchFirstPipeline(validated);
    // Return deck directly so the client can do: const data: Deck = await res.json()
    return NextResponse.json(deck, { status: 200 });
  } catch (error) {
    console.error("Generate error:", error);
    const isZodError =
      error instanceof Error && error.constructor.name === "ZodError";
    return NextResponse.json(
      {
        error: isZodError
          ? "Invalid request. Provide a topic string."
          : error instanceof Error
          ? error.message
          : "Generation failed",
      },
      { status: isZodError ? 400 : 500 }
    );
  }
}

// GET /api/generate - health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "OpenSpark Generate API",
    mode: "api-free",
    version: "1.0.0",
  });
}
