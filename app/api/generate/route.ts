import { NextRequest, NextResponse } from "next/server";
import {
  runResearchFirstPipeline,
} from "@/lib/agents";
import {
  GenerateDeckRequestSchema,
  Deck,
} from "@/lib/types";

// POST /api/generate
// Accepts a topic and returns a full research-backed presentation deck
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request using Zod schema
    const validated = GenerateDeckRequestSchema.parse(body);

    // Run the multi-agent Research-First pipeline
    const deck: Deck = await runResearchFirstPipeline(validated);

    // Return the deck with a clean response
    return NextResponse.json(
      {
        success: true,
        deck,
        message: `Generated ${deck.slides.length} slides for "${deck.title}"`,
        pipelineSteps: [
          { step: 1, name: "Researcher", status: "completed" },
          { step: 2, name: "Strategist", status: "completed" },
          { step: 3, name: "Designer", status: "completed" },
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    const isZodError = error?.name === "ZodError";

    return NextResponse.json(
      {
        success: false,
        error: isZodError
          ? "Invalid request format. Check topic and parameters."
          : error?.message || "Generation failed",
        details: isZodError ? error?.issues : undefined,
      },
      { status: isZodError ? 400 : 500 }
    );
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "OpenSpark Generate API",
    version: "0.1.0",
    pipeline: ["Researcher Agent", "Strategist Agent", "Designer Agent"],
    ready: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
}
