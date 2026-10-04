import { NextResponse } from "next/server";
import { analyzeDecisionWithGemini } from "@/lib/reasoningEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { decision, context, options, goals, constraints, deadline } = body;

    if (!decision || typeof decision !== "string" || !decision.trim()) {
      return NextResponse.json({ error: "Please provide a decision to analyze." }, { status: 400 });
    }

    const structuredModel = await analyzeDecisionWithGemini({
      decision: decision.trim(),
      context: context?.trim(),
      options: options?.trim(),
      goals: goals?.trim(),
      constraints: constraints?.trim(),
      deadline: deadline?.trim()
    });

    return NextResponse.json(structuredModel);
  } catch (error: any) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process decision analysis." },
      { status: 500 }
    );
  }
}
