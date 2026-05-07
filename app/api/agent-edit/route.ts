import { NextRequest, NextResponse } from "next/server";
import { agentEdit, runResearchFirstPipeline } from "@/lib/agents";
import { AgentEditRequestSchema } from "@/lib/types";

// POST /api/agent-edit
// API-free natural language slide editing using rule-based patterns
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deck, slideIndex, instruction } = AgentEditRequestSchema.parse(body);

    // Apply rule-based edit to the specified slide
    const updatedDeck = agentEdit(deck, slideIndex, instruction);

    return NextResponse.json(
      { deck: updatedDeck, message: "Slide updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Agent edit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Edit failed" },
      { status: 500 }
    );
  }
}

// GET /api/agent-edit - health check
export async function GET() {
  return NextResponse.json({ status: "ok", mode: "api-free" });
}
