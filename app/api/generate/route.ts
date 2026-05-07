import { NextRequest, NextResponse } from "next/server";
import { runResearchFirstPipeline } from "@/lib/agents";
import { GenerateDeckRequestSchema, Deck } from "@/lib/types";

// POST /api/generate
// API-free multi-agent presentation generation pipeline
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = GenerateDeckRequestSchema.parse(body);
    const deck: Deck = runResearchFirstPipeline(validated);
    return NextResponse.json(
      {
        success: true,
        deck,
        message: "Generated " + deck.slides.length + " slides for: " + deck.title,
        pipelineSteps: [
          { step: 1, name: "Researcher", status: "completed" },
          { step: 2, name: "Strategist", status: "completed" },
          { step: 3, name: "Designer", status: "completed" },
        ],
        apiFree: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const isZodError = error?.name === "ZodError";
    return NextResponse.json(
      {
        success: false,
        error: isZodError
          ? "Invalid request. Check topic and parameters."
          : error?.message || "Generation failed",
        details: isZodError ? error?.issues : undefined,
      },
      { status: isZodError ? 400 : 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "OpenSpark Generate API",
    version: "0.1.0",
    pipeline: ["Researcher", "Strategist", "Designer"],
    apiFree: true,
  });
}
