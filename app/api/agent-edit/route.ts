import { NextRequest, NextResponse } from "next/server";
import { agentEdit } from "@/lib/agents";
import {
  AgentEditRequestSchema,
  AgentEditResponseSchema,
  AgentEditResponse,
} from "@/lib/types";
import { SAMPLE_DECK } from "@/lib/sample-data";

// POST /api/agent-edit
// API-free natural language slide editing using rule-based patterns
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AgentEditRequestSchema.parse(body);
    const { slideNumber, instruction } = validated;

    // Get the current slide from sample deck
    const slide = SAMPLE_DECK.slides.find((s) => s.slideNumber === slideNumber);

    if (!slide) {
      return NextResponse.json(
        {
          success: false,
          error: "Slide " + slideNumber + " not found. Available: 1-" + SAMPLE_DECK.slides.length,
        },
        { status: 404 }
      );
    }

    // Apply rule-based edit
    const result: AgentEditResponse = agentEdit(slide, instruction);

    // Validate response
    const validatedResult = AgentEditResponseSchema.parse(result);

    return NextResponse.json(
      {
        success: true,
        ...validatedResult,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const isZodError = error?.name === "ZodError";
    return NextResponse.json(
      {
        success: false,
        error: isZodError
          ? "Invalid request. Include slideNumber and instruction."
          : error?.message || "Edit failed",
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
    service: "OpenSpark Agent Edit API",
    version: "0.1.0",
    apiFree: true,
    rules: ["professional", "dark", "creative", "simple", "detailed"],
  });
}
