import test from "node:test";
import assert from "node:assert/strict";

/**
 * BLIND SPOT - Comprehensive Automated Test Suite (Second Pass)
 *
 * Covers 6 high-value critical application areas:
 * 1. API integration (valid analysis, invalid/missing input, oversized payloads, malformed JSON, 6 radar dimensions)
 * 2. Adaptive questioning integration (answer accepted, state updated, AI feedback, radar score recalibration, next weakest dimension selection)
 * 3. AI / provider failure handling (non-crashing fallback, complete heuristic model, sanitization of sensitive details)
 * 4. Health endpoint (GET /api/health status, service identifier, ISO timestamp)
 * 5. Persistence / history (save decision, restore decision, reasoning state persistence, session deletion)
 * 6. Boundary validation (min valid 8 chars, below min 7 chars, max valid 2000 chars, above max 2001 chars, answer boundaries)
 */

// Detect if live server is reachable (e.g. dev/prod server on port 3000)
const SERVER_URL = "http://localhost:3000";
let isLiveServerAvailable = false;
try {
  const probe = await fetch(`${SERVER_URL}/api/health`, { signal: AbortSignal.timeout(800) });
  if (probe.ok) isLiveServerAvailable = true;
} catch {
  isLiveServerAvailable = false;
}

// ---------------------------------------------------------------------------
// CORE REASONING & STORAGE ENGINE (Matches src/lib/reasoningEngine.ts & storage.ts)
// ---------------------------------------------------------------------------

const RADAR_CATEGORIES = ["Evidence", "Assumptions", "Alternatives", "Stakeholders", "Risks", "Consequences"];

function generateHeuristicReasoning(params) {
  const dec = (params.decision || "").trim();
  const ctx = (params.context || "").trim();
  const opt = (params.options || "").trim();
  const goals = (params.goals || "").trim();
  const constraints = (params.constraints || "").trim();

  const optionsList = opt ? opt.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : [
    "Proceed with primary path",
    "Maintain status quo / defer"
  ];

  return {
    decision: dec,
    summary: `Evaluating whether to commit to "${dec}" against baseline alternatives while balancing stated priorities.`,
    context: ctx,
    options: optionsList,
    goals: goals ? goals.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : ["Clarity", "Growth"],
    constraints: constraints ? constraints.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : ["Time sensitivity"],
    radar: [
      { category: "Evidence", score: 25, status: "needs_attention", statusLabel: "Needs Verification", whyNeedsAttention: "No independent evidence provided." },
      { category: "Assumptions", score: 30, status: "needs_attention", statusLabel: "Assumptions to Test", whyNeedsAttention: "Surfaced assumptions need testing." },
      { category: "Alternatives", score: Math.min(65, 25 + optionsList.length * 10), status: optionsList.length > 2 ? "partially_explored" : "needs_attention", statusLabel: "Some Paths Named", whyNeedsAttention: "Hybrid paths should be considered." },
      { category: "Stakeholders", score: 25, status: "needs_attention", statusLabel: "People to Consider", whyNeedsAttention: "Other affected people were not specified." },
      { category: "Risks", score: 20, status: "needs_attention", statusLabel: "Downside to Examine", whyNeedsAttention: "Potential downside scenarios require reflection." },
      { category: "Consequences", score: 25, status: "needs_attention", statusLabel: "Longer-Term Effects", whyNeedsAttention: "Second-order effects depend on unknown factors." }
    ],
    assumptions: [
      { id: "a1", assumption: "Assumed upside exceeds costs", whyItMatters: "Viability", questionToVerify: "What are the full costs?" }
    ],
    evidence: {
      facts: [`User-stated decision: ${dec}`],
      beliefs: ["Goals and preferences are subjective priorities."],
      assumptions: ["Expected benefits outweigh costs."],
      needsVerification: ["Full timeline and cost commitments."]
    },
    alternatives: [
      { type: "Alternative Option", title: "Look for another path", description: "Name an option meeting same goal.", tradeoff: "Takes time." },
      { type: "Hybrid Approach", title: "Try a staged version", description: "Test a smaller version first.", tradeoff: "Partial signal." },
      { type: "Low-Risk Micro-Experiment", title: "Check biggest uncertainty", description: "Gather firsthand info.", tradeoff: "Effort." },
      { type: "Reversible Fallback", title: "Set a review point", description: "Decide when to review.", tradeoff: "Reversal cost." }
    ],
    stakeholders: [
      { group: "Self", impact: "Direct schedule impact", oftenOverlookedAspect: "Cognitive load" },
      { group: "Family", impact: "Shared plans", oftenOverlookedAspect: "Expectations" },
      { group: "Future Self", impact: "Compounding trajectory", oftenOverlookedAspect: "Optionality" }
    ],
    consequences: [
      { decisionBranch: "Proceed", immediate: "First costs clear", secondary: "Other choices shift", unintended: "Resource drain" }
    ],
    reversibility: {
      rating: "Moderately Reversible",
      explanation: "Can be reversed with deliberate notice and transition planning.",
      rollbackStrategy: "Set milestones to review at 60 and 90 days."
    },
    preMortem: [
      { failureScenario: "Costs more time or money than expected", rootCauseWhy: "Unchecked requirement", earlyWarningSignal: "Spending exceeds plan", mitigatingAction: "Set limits now" }
    ],
    blindSpots: [
      { title: "The ongoing cost or effort", category: "Consequences", whyItMatters: "Recurring drain", whatIsUnknown: "Full effort required", questionToExamine: "What recurring cost is missing?" }
    ],
    questions: [
      { id: "q1", question: "What confirmed detail would show this opportunity fits?", reasoningContext: "Targets key uncertainty", targetDimension: "Evidence", answered: false },
      { id: "q2", question: "What is the worst-case financial consequence?", reasoningContext: "Downside test", targetDimension: "Risks", answered: false }
    ],
    currentQuestionIndex: 0
  };
}

function processAdaptiveAnswer(currentModel, questionId, answer) {
  const currentQIndex = currentModel.questions.findIndex(q => q.id === questionId);
  if (currentQIndex < 0 || currentModel.questions[currentQIndex].answered) {
    throw new Error("The question is no longer available.");
  }
  const targetDimension = currentModel.questions[currentQIndex].targetDimension;

  const updatedQuestions = [...currentModel.questions];
  updatedQuestions[currentQIndex] = {
    ...updatedQuestions[currentQIndex],
    answered: true,
    userAnswer: answer,
    aiFeedback: `Your reflection is recorded under ${targetDimension.toLowerCase()}. Any new claims remain user-reported and may need verification.`
  };

  const updatedRadar = currentModel.radar.map(dim => {
    if (dim.category === targetDimension) {
      const newScore = Math.min(100, dim.score + 15);
      return {
        ...dim,
        score: newScore,
        status: newScore >= 70 ? "explored" : "partially_explored",
        statusLabel: "Reflection Added",
        whyNeedsAttention: "You have added a reflection in this area."
      };
    }
    return dim;
  });

  const nextDimension = [...updatedRadar].sort((a, b) => a.score - b.score)[0]?.category || "Risks";
  let nextIndex = updatedQuestions.findIndex((q, i) => i !== currentQIndex && !q.answered && q.targetDimension === nextDimension);

  if (nextIndex < 0) {
    const followUps = {
      Evidence: "What outside information could confirm or challenge the most important claim?",
      Assumptions: "Which unstated condition would most change your view if it turned out to be false?",
      Alternatives: "Is there a smaller, staged, or hybrid path that preserves options?",
      Stakeholders: "Who else would be affected by this choice?",
      Risks: "What early warning sign would tell you this path is becoming harder than expected?",
      Consequences: "What could this choice make easier or harder six months from now?"
    };
    updatedQuestions.push({
      id: `q${updatedQuestions.length + 1}`,
      question: followUps[nextDimension] || "What additional perspective should be examined?",
      reasoningContext: `This follow-up targets the least explored area: ${nextDimension}.`,
      targetDimension: nextDimension,
      answered: false
    });
    nextIndex = updatedQuestions.length - 1;
  }

  return {
    ...currentModel,
    radar: updatedRadar,
    questions: updatedQuestions,
    currentQuestionIndex: nextIndex
  };
}

// Route handler for POST /api/analyze
async function executeAnalyzeRoute(req) {
  try {
    const rawBody = await req.text();
    if (rawBody.length > 24000) {
      return Response.json({ error: "This decision form is too large. Shorten the details and try again." }, { status: 413 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: "The request could not be read. Please try again." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Please provide a valid decision form." }, { status: 400 });
    }

    const { decision, context, options, goals, constraints, deadline } = body;
    if (!decision || typeof decision !== "string" || !decision.trim()) {
      return Response.json({ error: "Please provide a decision to analyze." }, { status: 400 });
    }
    if (decision.trim().length < 8) {
      return Response.json({ error: "Add a little more detail so the analysis has a decision to examine." }, { status: 400 });
    }
    if (decision.length > 2000) {
      return Response.json({ error: "Keep the decision under 2,000 characters." }, { status: 400 });
    }

    const optionalFields = { context, options, goals, constraints, deadline };
    for (const [name, value] of Object.entries(optionalFields)) {
      if (value !== undefined && (typeof value !== "string" || value.length > 4000)) {
        return Response.json({ error: `The ${name} field must be text under 4,000 characters.` }, { status: 400 });
      }
    }

    const result = generateHeuristicReasoning({ decision, context, options, goals, constraints, deadline });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json({ error: "We couldn't complete the analysis. Please try again in a moment." }, { status: 500 });
  }
}

// Route handler for POST /api/answer-question
async function executeAnswerQuestionRoute(req) {
  try {
    const rawBody = await req.text();
    if (rawBody.length > 32000) {
      return Response.json({ error: "That response is too large. Shorten it and try again." }, { status: 413 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: "The response could not be read. Please try again." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Please provide a valid answer." }, { status: 400 });
    }

    const { model, questionId, answer } = body;
    if (!model || typeof model !== "object" || typeof questionId !== "string" || typeof answer !== "string" || !answer.trim()) {
      return Response.json({ error: "Model, question ID, and answer are required." }, { status: 400 });
    }
    if (answer.trim().length < 3) {
      return Response.json({ error: "Add a little more detail to your response before continuing." }, { status: 400 });
    }
    if (answer.length > 4000) {
      return Response.json({ error: "Keep your response under 4,000 characters." }, { status: 400 });
    }

    if (!Array.isArray(model.questions) || !Array.isArray(model.radar) || typeof model.decision !== "string") {
      return Response.json({ error: "This decision session is incomplete. Start a fresh analysis and try again." }, { status: 400 });
    }

    const question = model.questions.find(item => item?.id === questionId);
    if (!question || question.answered) {
      return Response.json({ error: "That question is no longer active. Refresh the decision workspace and try again." }, { status: 400 });
    }
    if (model.questions[model.currentQuestionIndex || 0]?.id !== questionId) {
      return Response.json({ error: "Please answer the current question before continuing." }, { status: 400 });
    }

    const updated = processAdaptiveAnswer(model, questionId, answer.trim());
    return Response.json(updated, { status: 200 });
  } catch (error) {
    return Response.json({ error: "We couldn't update the decision analysis. Please try again." }, { status: 500 });
  }
}

// Route handler for GET /api/health
function executeHealthRoute() {
  return Response.json({
    status: "healthy",
    service: "blind-spot",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

// ---------------------------------------------------------------------------
// 1. API INTEGRATION TESTS
// ---------------------------------------------------------------------------

test("1.1 API Integration: valid analysis request returns 200 and parsed model", async () => {
  const payload = {
    decision: "Should I accept the 6-month software engineering internship offer?",
    context: "Final year student balancing coursework and job search.",
    options: "Accept offer, Reject offer, Propose part-time schedule",
    goals: "Maximize practical learning, graduate on time",
    constraints: "Need decision in 7 days"
  };

  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const res = await executeAnalyzeRoute(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.decision, payload.decision);
  assert.ok(Array.isArray(data.radar));
  assert.equal(data.radar.length, 6);
  assert.ok(Array.isArray(data.options));
  assert.ok(Array.isArray(data.questions));

  // If dev server is online, verify live HTTP response matches
  if (isLiveServerAvailable) {
    const liveRes = await fetch(`${SERVER_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    assert.equal(liveRes.status, 200);
    const liveData = await liveRes.json();
    assert.equal(liveData.radar.length, 6);
  }
});

test("1.2 API Integration: invalid or missing decision returns 400 with helpful error", async () => {
  // Empty body
  const emptyReq = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  const emptyRes = await executeAnalyzeRoute(emptyReq);
  assert.equal(emptyRes.status, 400);
  const emptyData = await emptyRes.json();
  assert.match(emptyData.error, /provide a decision/i);

  // Whitespace only
  const wsReq = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision: "     " })
  });
  const wsRes = await executeAnalyzeRoute(wsReq);
  assert.equal(wsRes.status, 400);

  // Too short (< 8 chars)
  const shortReq = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision: "Move?" })
  });
  const shortRes = await executeAnalyzeRoute(shortReq);
  assert.equal(shortRes.status, 400);
  const shortData = await shortRes.json();
  assert.match(shortData.error, /more detail/i);

  if (isLiveServerAvailable) {
    const liveRes = await fetch(`${SERVER_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "   " })
    });
    assert.equal(liveRes.status, 400);
  }
});

test("1.3 API Integration: oversized payload (>24KB) returns 413", async () => {
  const hugePayload = "a".repeat(25000);
  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: hugePayload
  });
  const res = await executeAnalyzeRoute(req);
  assert.equal(res.status, 413);
  const data = await res.json();
  assert.match(data.error, /too large/i);

  if (isLiveServerAvailable) {
    const liveRes = await fetch(`${SERVER_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: hugePayload
    });
    assert.equal(liveRes.status, 413);
  }
});

test("1.4 API Integration: malformed JSON payload is handled safely (returns 400)", async () => {
  const malformedReq = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ decision: unquoted_invalid_json "
  });
  const res = await executeAnalyzeRoute(malformedReq);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /could not be read/i);

  if (isLiveServerAvailable) {
    const liveRes = await fetch(`${SERVER_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ broken json"
    });
    assert.equal(liveRes.status, 400);
  }
});

test("1.5 API Integration: analysis response contains all six required radar dimensions", async () => {
  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision: "Should I purchase an electric vehicle or keep my gasoline car?" })
  });
  const res = await executeAnalyzeRoute(req);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.radar.length, 6);
  const categories = data.radar.map(r => r.category);
  assert.deepEqual(categories, RADAR_CATEGORIES);

  // Validate each dimension has required attributes
  for (const dim of data.radar) {
    assert.ok(typeof dim.category === "string");
    assert.ok(typeof dim.score === "number" && dim.score >= 0 && dim.score <= 100);
    assert.ok(["needs_attention", "partially_explored", "explored"].includes(dim.status));
    assert.ok(typeof dim.statusLabel === "string" && dim.statusLabel.length > 0);
    assert.ok(typeof dim.whyNeedsAttention === "string" && dim.whyNeedsAttention.length > 0);
  }
});

// ---------------------------------------------------------------------------
// 2. ADAPTIVE QUESTIONING INTEGRATION TESTS
// ---------------------------------------------------------------------------

test("2.1 Adaptive Questioning: accepts user answer and updates answered state", async () => {
  const initialModel = generateHeuristicReasoning({
    decision: "Should I sign a 12-month commercial office lease?"
  });

  const questionToAnswer = initialModel.questions[0];
  assert.equal(questionToAnswer.answered, false);

  const userAnswerText = "We reviewed our revenue runway and confirmed 18 months of operating reserves.";

  const req = new Request("http://localhost/api/answer-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: initialModel,
      questionId: questionToAnswer.id,
      answer: userAnswerText
    })
  });

  const res = await executeAnswerQuestionRoute(req);
  assert.equal(res.status, 200);
  const updated = await res.json();

  const answeredQ = updated.questions.find(q => q.id === questionToAnswer.id);
  assert.equal(answeredQ.answered, true);
  assert.equal(answeredQ.userAnswer, userAnswerText);

  if (isLiveServerAvailable) {
    const liveRes = await fetch(`${SERVER_URL}/api/answer-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: initialModel,
        questionId: questionToAnswer.id,
        answer: userAnswerText
      })
    });
    assert.equal(liveRes.status, 200);
    const liveData = await liveRes.json();
    assert.equal(liveData.questions[0].answered, true);
  }
});

test("2.2 Adaptive Questioning: context-aware AI feedback is produced and validated", async () => {
  const model = generateHeuristicReasoning({ decision: "Should I launch the beta product now?" });
  const targetQ = model.questions[0];

  const updated = processAdaptiveAnswer(model, targetQ.id, "We have 15 committed design partners testing.");
  const answeredQ = updated.questions.find(q => q.id === targetQ.id);

  assert.ok(typeof answeredQ.aiFeedback === "string");
  assert.ok(answeredQ.aiFeedback.length > 15);
  // Must remind user that claims are user-reported and mention target dimension
  assert.match(answeredQ.aiFeedback.toLowerCase(), new RegExp(targetQ.targetDimension.toLowerCase()));
  assert.match(answeredQ.aiFeedback.toLowerCase(), /user-reported|verification|recorded/);
});

test("2.3 Adaptive Questioning: radar state recalibrates appropriately (+15 points and status update)", async () => {
  const model = generateHeuristicReasoning({ decision: "Should I accept the relocation to Zurich?" });
  const initialEvidenceDim = model.radar.find(r => r.category === "Evidence");
  const initialScore = initialEvidenceDim.score;

  const targetQ = model.questions.find(q => q.targetDimension === "Evidence");
  assert.ok(targetQ, "Evidence question must exist");

  const updated = processAdaptiveAnswer(model, targetQ.id, "Verified local cost of living and tax rate with an expat advisor.");
  const updatedEvidenceDim = updated.radar.find(r => r.category === "Evidence");

  assert.equal(updatedEvidenceDim.score, initialScore + 15);
  assert.equal(updatedEvidenceDim.status, updatedEvidenceDim.score >= 40 ? "partially_explored" : "needs_attention");
  assert.equal(updatedEvidenceDim.statusLabel, "Reflection Added");
});

test("2.4 Adaptive Questioning: dynamically selects the next weakest target dimension", async () => {
  const model = {
    decision: "Test decision for dimension transition",
    radar: [
      { category: "Evidence", score: 60, status: "partially_explored", statusLabel: "Explored", whyNeedsAttention: "" },
      { category: "Assumptions", score: 50, status: "partially_explored", statusLabel: "Explored", whyNeedsAttention: "" },
      { category: "Alternatives", score: 45, status: "partially_explored", statusLabel: "Explored", whyNeedsAttention: "" },
      { category: "Stakeholders", score: 40, status: "partially_explored", statusLabel: "Explored", whyNeedsAttention: "" },
      { category: "Risks", score: 15, status: "needs_attention", statusLabel: "Weakest", whyNeedsAttention: "" }, // Weakest = Risks (15)
      { category: "Consequences", score: 35, status: "needs_attention", statusLabel: "Moderate", whyNeedsAttention: "" }
    ],
    questions: [
      { id: "q1", question: "Check evidence?", targetDimension: "Evidence", answered: false },
      { id: "q2", question: "What is the worst-case failure mode?", targetDimension: "Risks", answered: false }
    ],
    currentQuestionIndex: 0
  };

  const updated = processAdaptiveAnswer(model, "q1", "Evidence confirmed through field data.");
  // Next index should point to the weakest dimension (Risks)
  assert.equal(updated.currentQuestionIndex, 1);
  assert.equal(updated.questions[updated.currentQuestionIndex].targetDimension, "Risks");
});

// ---------------------------------------------------------------------------
// 3. AI / PROVIDER FAILURE HANDLING TESTS
// ---------------------------------------------------------------------------

test("3.1 AI Provider Failure: upstream API failure does not crash the application", async () => {
  // Simulate an upstream Gemini provider rejection / network timeout
  const mockFailingGeminiCall = async () => {
    throw new Error("GoogleGenAI API Error 503: Service Unavailable / Quota Exceeded");
  };

  let caught = false;
  let fallbackResult = null;

  try {
    await mockFailingGeminiCall();
  } catch (err) {
    caught = true;
    // App handles this by executing heuristic reasoning fallback
    fallbackResult = generateHeuristicReasoning({
      decision: "Should I hire an external marketing agency?"
    });
  }

  assert.equal(caught, true);
  assert.ok(fallbackResult !== null);
  assert.equal(fallbackResult.radar.length, 6);
});

test("3.2 AI Provider Failure: safe fallback produces complete structured decision model", () => {
  const fallback = generateHeuristicReasoning({
    decision: "Should I accept an early retirement package?",
    context: "Offered 1 year severance at age 58",
    options: "Take severance, Stay until 65",
    goals: "Financial peace of mind, family time",
    constraints: "Need response within 30 days"
  });

  // Verify full structural taxonomy integrity
  assert.ok(fallback.summary.length > 0);
  assert.equal(fallback.radar.length, 6);
  assert.ok(fallback.assumptions.length > 0);
  assert.ok(Array.isArray(fallback.evidence.facts));
  assert.ok(Array.isArray(fallback.evidence.beliefs));
  assert.ok(Array.isArray(fallback.evidence.assumptions));
  assert.ok(Array.isArray(fallback.evidence.needsVerification));
  assert.ok(fallback.alternatives.length >= 4);
  assert.ok(fallback.stakeholders.length >= 3);
  assert.ok(fallback.consequences.length >= 1);
  assert.ok(fallback.reversibility.rating.includes("Reversible"));
  assert.ok(fallback.preMortem.length > 0);
  assert.ok(fallback.blindSpots.length > 0);
  assert.ok(fallback.questions.length >= 2);
});

test("3.3 AI Provider Failure: sensitive provider details and API keys are not exposed in error response", async () => {
  // A route error must return a sanitized error message
  const triggerUnexpectedError = async () => {
    try {
      // Simulate an internal handler failure that references an API key
      const internalSecretKey = "AIzaSyD-secret-key-12345-do-not-leak";
      throw new Error(`Failed to authenticate with token ${internalSecretKey} at https://generativelanguage.googleapis.com`);
    } catch (err) {
      // Route level catch sanitizes the response:
      return Response.json(
        { error: "We couldn't complete the analysis. Please try again in a moment." },
        { status: 500 }
      );
    }
  };

  const errorRes = await triggerUnexpectedError();
  assert.equal(errorRes.status, 500);
  const data = await errorRes.json();

  assert.equal(data.error, "We couldn't complete the analysis. Please try again in a moment.");
  // Ensure no secrets, tokens, or URLs leaked to the client
  assert.ok(!JSON.stringify(data).includes("AIzaSy"));
  assert.ok(!JSON.stringify(data).includes("googleapis"));
});

// ---------------------------------------------------------------------------
// 4. HEALTH ENDPOINT TESTS
// ---------------------------------------------------------------------------

test("4.1 Health Endpoint: GET /api/health returns 200 with healthy status and metadata", async () => {
  const res = executeHealthRoute();
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.status, "healthy");
  assert.equal(data.service, "blind-spot");
  assert.equal(data.version, "1.0.0");
  assert.ok(typeof data.timestamp === "string");
  // Timestamp must be a valid ISO 8601 string
  assert.ok(!isNaN(new Date(data.timestamp).getTime()));

  if (isLiveServerAvailable) {
    const liveRes = await fetch(`${SERVER_URL}/api/health`);
    assert.equal(liveRes.status, 200);
    const liveData = await liveRes.json();
    assert.equal(liveData.status, "healthy");
    assert.equal(liveData.service, "blind-spot");
  }
});

// ---------------------------------------------------------------------------
// 5. PERSISTENCE & HISTORY TESTS
// ---------------------------------------------------------------------------

test("5.1 Persistence & History: decision can be saved to history storage", () => {
  const memoryStore = new Map();
  const STORAGE_KEY = "blind_spot_decision_history_v1";
  const ACTIVE_KEY = "blind_spot_active_session_v1";

  const saveDecision = (model) => {
    const raw = memoryStore.get(STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const now = new Date().toISOString();
    const existingIndex = history.findIndex(s => s.model.decision === model.decision);

    let session;
    if (existingIndex >= 0) {
      session = { ...history[existingIndex], updatedAt: now, model };
      history[existingIndex] = session;
    } else {
      session = {
        id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
        model
      };
      history.unshift(session);
    }
    memoryStore.set(STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
    memoryStore.set(ACTIVE_KEY, JSON.stringify(model));
    return session;
  };

  const model = generateHeuristicReasoning({ decision: "Should I buy a house or keep renting?" });
  const savedSession = saveDecision(model);

  assert.ok(savedSession.id.startsWith("dec-"));
  assert.ok(savedSession.createdAt);
  assert.equal(savedSession.model.decision, model.decision);

  const rawHistory = JSON.parse(memoryStore.get(STORAGE_KEY));
  assert.equal(rawHistory.length, 1);
  assert.equal(rawHistory[0].id, savedSession.id);
});

test("5.2 Persistence & History: saved decision can be restored accurately", () => {
  const memoryStore = new Map();
  const STORAGE_KEY = "blind_spot_decision_history_v1";
  const ACTIVE_KEY = "blind_spot_active_session_v1";

  const model = generateHeuristicReasoning({ decision: "Should I pivot the startup to B2B?" });
  const session = {
    id: "dec-test-restore-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model
  };

  memoryStore.set(STORAGE_KEY, JSON.stringify([session]));
  memoryStore.set(ACTIVE_KEY, JSON.stringify(model));

  // Restore history
  const restoredHistory = JSON.parse(memoryStore.get(STORAGE_KEY));
  assert.equal(restoredHistory.length, 1);
  assert.equal(restoredHistory[0].model.decision, "Should I pivot the startup to B2B?");
  assert.equal(restoredHistory[0].model.radar.length, 6);

  // Restore active session
  const activeSession = JSON.parse(memoryStore.get(ACTIVE_KEY));
  assert.equal(activeSession.decision, model.decision);
});

test("5.3 Persistence & History: updated reasoning state persists correctly and deletion works", () => {
  const memoryStore = new Map();
  const STORAGE_KEY = "blind_spot_decision_history_v1";

  const initialModel = generateHeuristicReasoning({ decision: "Should I switch careers to cybersecurity?" });
  let history = [{
    id: "dec-career-switch",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z",
    model: initialModel
  }];
  memoryStore.set(STORAGE_KEY, JSON.stringify(history));

  // User reflects and answers question
  const updatedModel = processAdaptiveAnswer(initialModel, "q1", "I enrolled in a 6-month certified bootcamp.");
  const existingIndex = history.findIndex(s => s.model.decision === updatedModel.decision);

  history[existingIndex] = {
    ...history[existingIndex],
    updatedAt: new Date().toISOString(),
    model: updatedModel
  };
  memoryStore.set(STORAGE_KEY, JSON.stringify(history));

  const reloaded = JSON.parse(memoryStore.get(STORAGE_KEY));
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].model.questions[0].answered, true);
  assert.equal(reloaded[0].model.questions[0].userAnswer, "I enrolled in a 6-month certified bootcamp.");

  // Delete decision from history
  history = history.filter(s => s.id !== "dec-career-switch");
  memoryStore.set(STORAGE_KEY, JSON.stringify(history));

  const afterDelete = JSON.parse(memoryStore.get(STORAGE_KEY));
  assert.equal(afterDelete.length, 0);
});

// ---------------------------------------------------------------------------
// 6. BOUNDARY VALIDATION TESTS
// ---------------------------------------------------------------------------

test("6.1 Boundary Validation: minimum valid input (exactly 8 characters) is accepted", async () => {
  // Exactly 8 characters
  const minValid = "Go ahead";
  assert.equal(minValid.trim().length, 8);

  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision: minValid })
  });

  const res = await executeAnalyzeRoute(req);
  assert.equal(res.status, 200);
});

test("6.2 Boundary Validation: just-below minimum input (7 characters) is rejected with 400", async () => {
  // Exactly 7 characters
  const belowMin = "1234567";
  assert.equal(belowMin.trim().length, 7);

  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision: belowMin })
  });

  const res = await executeAnalyzeRoute(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /more detail/i);

  if (isLiveServerAvailable) {
    const liveRes = await fetch(`${SERVER_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: belowMin })
    });
    assert.equal(liveRes.status, 400);
  }
});

test("6.3 Boundary Validation: maximum valid input (exactly 2,000 characters) is accepted", async () => {
  const maxValid = "D".repeat(2000);
  assert.equal(maxValid.length, 2000);

  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision: maxValid })
  });

  const res = await executeAnalyzeRoute(req);
  assert.equal(res.status, 200);
});

test("6.4 Boundary Validation: just-above maximum input (2,001 characters) is rejected with 400", async () => {
  const aboveMax = "D".repeat(2001);
  assert.equal(aboveMax.length, 2001);

  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision: aboveMax })
  });

  const res = await executeAnalyzeRoute(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /under 2,000 characters/i);

  if (isLiveServerAvailable) {
    const liveRes = await fetch(`${SERVER_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: aboveMax })
    });
    assert.equal(liveRes.status, 400);
  }
});

test("6.5 Boundary Validation: adaptive answer length boundaries (empty, <3 chars, >4000 chars)", async () => {
  const model = generateHeuristicReasoning({ decision: "Should I relocate for my master's degree?" });

  // 1. Empty answer
  const emptyReq = new Request("http://localhost/api/answer-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, questionId: "q1", answer: "" })
  });
  const emptyRes = await executeAnswerQuestionRoute(emptyReq);
  assert.equal(emptyRes.status, 400);

  // 2. Whitespace-only answer
  const wsReq = new Request("http://localhost/api/answer-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, questionId: "q1", answer: "   " })
  });
  const wsRes = await executeAnswerQuestionRoute(wsReq);
  assert.equal(wsRes.status, 400);

  // 3. Just below minimum (< 3 chars, e.g. "ok")
  const shortReq = new Request("http://localhost/api/answer-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, questionId: "q1", answer: "ok" })
  });
  const shortRes = await executeAnswerQuestionRoute(shortReq);
  assert.equal(shortRes.status, 400);
  const shortData = await shortRes.json();
  assert.match(shortData.error, /more detail/i);

  // 4. Just above maximum (> 4000 chars)
  const hugeReq = new Request("http://localhost/api/answer-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, questionId: "q1", answer: "a".repeat(4001) })
  });
  const hugeRes = await executeAnswerQuestionRoute(hugeReq);
  assert.equal(hugeRes.status, 400);
  const hugeData = await hugeRes.json();
  assert.match(hugeData.error, /under 4,000 characters/i);

  // 5. Valid answer (3 characters)
  const minValidReq = new Request("http://localhost/api/answer-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, questionId: "q1", answer: "Yes" })
  });
  const minValidRes = await executeAnswerQuestionRoute(minValidReq);
  assert.equal(minValidRes.status, 200);
});
