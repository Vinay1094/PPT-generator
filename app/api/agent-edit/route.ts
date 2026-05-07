import { NextRequest, NextResponse } from "next/server";
import { resumePipeline } from "@/lib/agents";
import {
  AgentEditRequestSchema,
  AgentEditResponseSchema,
  AgentEditResponse,
} from "@/lib/types";

// POST /api/agent-edit
// Natural language editing of a slide's content
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AgentEditRequestSchema.parse(body);
    const { slideNumber, instruction } = validated;

    // In a real implementation, we'd need the full slide context
    // For now, we'll use the stub from agents.ts
    // The slide would typically be passed from the client or stored server-side

    const response: AgentEditResponse = {
      slideNumber,
      updatedBlocks: [],
      reason: "Agent edit processed",
    };

    // Validate response schema
    const validatedResponse = AgentEditResponseSchema.parse(response);

    return NextResponse.json(
      {
        success: true,
        ...validatedResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const isZodError = error?.name === "ZodError";
    return NextResponse.json(
      {
        success: false,
        error: isZodError
          ? "Invalid edit request. Include slideNumber and instruction."
          : error?.message || "Edit failed",
      },
      { status: isZodError ? 400 : 500 }
    );
  }
}
