import { NextResponse } from "next/server";
import { processAdaptiveAnswer } from "@/lib/reasoningEngine";
import { StructuredDecisionModel } from "@/types/decision";

export async function POST(req: Request) {
  try {
    const { model, questionId, answer } = await req.json();

    if (!model || !questionId || !answer || typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Model, question ID, and answer are required." }, { status: 400 });
    }

    const updatedModel = await processAdaptiveAnswer(model as StructuredDecisionModel, questionId, answer.trim());
    return NextResponse.json(updatedModel);
  } catch (error: any) {
    console.error("Adaptive answer API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process question answer." },
      { status: 500 }
    );
  }
}
