import { NextResponse } from "next/server";
import { analyzeDecisionWithGemini } from "@/lib/reasoningEngine";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (rawBody.length > 24_000) {
      return NextResponse.json({ error: "This decision form is too large. Shorten the details and try again." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "The request could not be read. Please try again." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Please provide a valid decision form." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const { decision, context, options, goals, constraints, deadline } = input;

    if (!decision || typeof decision !== "string" || !decision.trim()) {
      return NextResponse.json({ error: "Please provide a decision to analyze." }, { status: 400 });
    }
    if (decision.trim().length < 8) {
      return NextResponse.json({ error: "Add a little more detail so the analysis has a decision to examine." }, { status: 400 });
    }
    if (decision.length > 2_000) {
      return NextResponse.json({ error: "Keep the decision under 2,000 characters." }, { status: 400 });
    }

    const optionalFields = { context, options, goals, constraints, deadline };
    for (const [name, value] of Object.entries(optionalFields)) {
      if (value !== undefined && (typeof value !== "string" || value.length > 4_000)) {
        return NextResponse.json({ error: `The ${name} field must be text under 4,000 characters.` }, { status: 400 });
      }
    }

    const structuredModel = await analyzeDecisionWithGemini({
      decision: decision.trim(),
      context: typeof context === "string" ? context.trim() : undefined,
      options: typeof options === "string" ? options.trim() : undefined,
      goals: typeof goals === "string" ? goals.trim() : undefined,
      constraints: typeof constraints === "string" ? constraints.trim() : undefined,
      deadline: typeof deadline === "string" ? deadline.trim() : undefined
    });

    return NextResponse.json(structuredModel);
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "We couldn't complete the analysis. Please try again in a moment." },
      { status: 500 }
    );
  }
}
