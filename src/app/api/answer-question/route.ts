import { NextResponse } from "next/server";
import { processAdaptiveAnswer } from "@/lib/reasoningEngine";
import { StructuredDecisionModel } from "@/types/decision";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (rawBody.length > 32_000) {
      return NextResponse.json({ error: "That response is too large. Shorten it and try again." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "The response could not be read. Please try again." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Please provide a valid answer." }, { status: 400 });
    }

    const { model, questionId, answer } = body as Record<string, unknown>;

    if (!model || typeof model !== "object" || typeof questionId !== "string" || typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Model, question ID, and answer are required." }, { status: 400 });
    }
    if (answer.trim().length < 3) {
      return NextResponse.json({ error: "Add a little more detail to your response before continuing." }, { status: 400 });
    }
    if (answer.length > 4_000) {
      return NextResponse.json({ error: "Keep your response under 4,000 characters." }, { status: 400 });
    }

    const candidate = model as Partial<StructuredDecisionModel>;
    if (!Array.isArray(candidate.questions) || !Array.isArray(candidate.radar) || typeof candidate.decision !== "string") {
      return NextResponse.json({ error: "This decision session is incomplete. Start a fresh analysis and try again." }, { status: 400 });
    }
    const question = candidate.questions.find(item => item?.id === questionId);
    if (!question || question.answered) {
      return NextResponse.json({ error: "That question is no longer active. Refresh the decision workspace and try again." }, { status: 400 });
    }
    if (candidate.questions[candidate.currentQuestionIndex || 0]?.id !== questionId) {
      return NextResponse.json({ error: "Please answer the current question before continuing." }, { status: 400 });
    }

    const updatedModel = await processAdaptiveAnswer(model as StructuredDecisionModel, questionId, answer.trim());
    return NextResponse.json(updatedModel);
  } catch (error) {
    console.error("Adaptive answer API error:", error);
    return NextResponse.json(
      { error: "We couldn't update the decision analysis. Please try again." },
      { status: 500 }
    );
  }
}
