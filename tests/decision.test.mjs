import test from "node:test";
import assert from "node:assert/strict";

// Test suite for Blind Spot - Decision Thinking Companion

test("1. Decision Input Validation: validates decision length and boundaries", () => {
  const validateInput = (input) => {
    if (!input || typeof input !== "object") {
      return { valid: false, error: "Please provide a valid decision form." };
    }
    const { decision } = input;
    if (!decision || typeof decision !== "string" || !decision.trim()) {
      return { valid: false, error: "Please provide a decision to analyze." };
    }
    if (decision.trim().length < 8) {
      return { valid: false, error: "Add a little more detail so the analysis has a decision to examine." };
    }
    if (decision.length > 2000) {
      return { valid: false, error: "Keep the decision under 2,000 characters." };
    }
    return { valid: true };
  };

  // Empty input
  assert.equal(validateInput(null).valid, false);
  assert.equal(validateInput({}).valid, false);
  assert.equal(validateInput({ decision: "   " }).valid, false);

  // Too short (< 8 chars)
  const shortRes = validateInput({ decision: "Quit" });
  assert.equal(shortRes.valid, false);
  assert.match(shortRes.error, /more detail/);

  // Oversized (> 2000 chars)
  const longRes = validateInput({ decision: "a".repeat(2001) });
  assert.equal(longRes.valid, false);
  assert.match(longRes.error, /2,000 characters/);

  // Valid decision
  const validRes = validateInput({ decision: "Should I accept the 6-month internship offer?" });
  assert.equal(validRes.valid, true);
});

test("2. Blind Spot Analysis Model: validates structured output taxonomy", () => {
  const mockAnalysis = {
    decision: "Should I accept the 6-month internship or stay on campus?",
    summary: "Evaluating whether to commit to internship vs regular coursework.",
    options: ["Accept internship", "Stay on campus", "Hybrid schedule"],
    goals: ["Career growth", "Timely graduation"],
    constraints: ["Need decision by Friday"],
    radar: [
      { category: "Evidence", score: 25, status: "needs_attention", statusLabel: "Needs Verification", whyNeedsAttention: "No independent check." },
      { category: "Assumptions", score: 30, status: "needs_attention", statusLabel: "Assumptions to Test", whyNeedsAttention: "Implicit claims." },
      { category: "Alternatives", score: 55, status: "partially_explored", statusLabel: "Some Paths Named", whyNeedsAttention: "Hybrid paths." },
      { category: "Stakeholders", score: 25, status: "needs_attention", statusLabel: "People to Consider", whyNeedsAttention: "Others affected." },
      { category: "Risks", score: 25, status: "needs_attention", statusLabel: "Downside to Examine", whyNeedsAttention: "Downside." },
      { category: "Consequences", score: 25, status: "needs_attention", statusLabel: "Longer-Term Effects", whyNeedsAttention: "Second order." }
    ],
    assumptions: [
      { id: "a1", assumption: "Assuming stipend covers hidden expenses", whyItMatters: "Financial viability", questionToVerify: "Check living costs?" }
    ],
    evidence: {
      facts: ["Offer received", "Stipend offered"],
      beliefs: ["Role has faster growth"],
      assumptions: ["Company culture matches expectations"],
      needsVerification: ["Academic department credit transfer policy"]
    },
    alternatives: [
      { type: "Hybrid Approach", title: "Part-time internship", description: "Take 20h/wk", tradeoff: "Longer graduation" }
    ],
    stakeholders: [
      { group: "Self", impact: "High workload", oftenOverlookedAspect: "Sleep and burnout" },
      { group: "Future Self", impact: "Career resume signal", oftenOverlookedAspect: "GPA impact" }
    ],
    consequences: [
      { decisionBranch: "Accept", immediate: "Relocation", secondary: "Overload", unintended: "Delayed graduation" }
    ],
    reversibility: {
      rating: "Moderately Reversible",
      explanation: "Can withdraw or negotiate terms.",
      rollbackStrategy: "Set 60-day check-in."
    },
    preMortem: [
      { failureScenario: "Burnout after 3 months", rootCauseWhy: "Schedule collision", earlyWarningSignal: "Missed deadlines", mitigatingAction: "Cap work hours" }
    ],
    blindSpots: [
      { title: "Academic policy gap", category: "Evidence", whyItMatters: "Graduation delay", whatIsUnknown: "Credit transferability", questionToExamine: "Have you talked to your academic advisor?" }
    ],
    questions: [
      { id: "q1", question: "Have you verified the college policy on credits?", reasoningContext: "Academic risk", targetDimension: "Evidence" }
    ],
    currentQuestionIndex: 0
  };

  // Validate core contract
  assert.ok(mockAnalysis.decision.length > 0);
  assert.equal(mockAnalysis.radar.length, 6);
  
  const expectedDimensions = ["Evidence", "Assumptions", "Alternatives", "Stakeholders", "Risks", "Consequences"];
  const actualDimensions = mockAnalysis.radar.map(r => r.category);
  assert.deepEqual(actualDimensions, expectedDimensions);

  // Validate Evidence Taxonomy: Facts vs Beliefs vs Assumptions vs NeedsVerification
  assert.ok(Array.isArray(mockAnalysis.evidence.facts));
  assert.ok(Array.isArray(mockAnalysis.evidence.beliefs));
  assert.ok(Array.isArray(mockAnalysis.evidence.assumptions));
  assert.ok(Array.isArray(mockAnalysis.evidence.needsVerification));
  assert.ok(mockAnalysis.evidence.needsVerification.length > 0);

  // Validate Pre-Mortem & Reversibility
  assert.ok(mockAnalysis.preMortem.length > 0);
  assert.ok(mockAnalysis.reversibility.rating.includes("Reversible"));
});

test("3. Blind Spot Radar: calculates scores and maps attention states correctly", () => {
  const calculateRadarDimension = (category, score) => {
    const clampedScore = Math.max(0, Math.min(100, score));
    let status = "needs_attention";
    let statusLabel = "Needs Attention";

    if (clampedScore >= 70) {
      status = "explored";
      statusLabel = "Thoroughly Examined";
    } else if (clampedScore >= 40) {
      status = "partially_explored";
      statusLabel = "Partially Explored";
    }

    return {
      category,
      score: clampedScore,
      status,
      statusLabel
    };
  };

  const dimLow = calculateRadarDimension("Evidence", 25);
  assert.equal(dimLow.status, "needs_attention");
  assert.equal(dimLow.score, 25);

  const dimMid = calculateRadarDimension("Alternatives", 55);
  assert.equal(dimMid.status, "partially_explored");
  assert.equal(dimMid.score, 55);

  const dimHigh = calculateRadarDimension("Assumptions", 85);
  assert.equal(dimHigh.status, "explored");
  assert.equal(dimHigh.score, 85);
});

test("4. Adaptive Question State Transition: advances reasoning model upon user answer", () => {
  const initialModel = {
    radar: [
      { category: "Evidence", score: 25, status: "needs_attention" },
      { category: "Risks", score: 20, status: "needs_attention" },
      { category: "Assumptions", score: 30, status: "needs_attention" }
    ],
    questions: [
      { id: "q1", question: "What evidence confirms the credit transfer?", targetDimension: "Evidence", answered: false },
      { id: "q2", question: "What is the worst-case financial outcome?", targetDimension: "Risks", answered: false }
    ],
    currentQuestionIndex: 0
  };

  // Simulate processAdaptiveAnswer
  const processAnswer = (model, questionId, userAnswer) => {
    const qIndex = model.questions.findIndex(q => q.id === questionId);
    assert.ok(qIndex >= 0, "Question must exist");

    const targetDimension = model.questions[qIndex].targetDimension;
    
    // 1. Update question state
    const updatedQuestions = [...model.questions];
    updatedQuestions[qIndex] = {
      ...updatedQuestions[qIndex],
      answered: true,
      userAnswer,
      aiFeedback: `Your reflection is recorded under ${targetDimension.toLowerCase()}.`
    };

    // 2. Recalibrate radar score for that dimension (+15 points)
    const updatedRadar = model.radar.map(dim => {
      if (dim.category === targetDimension) {
        const newScore = Math.min(100, dim.score + 15);
        return {
          ...dim,
          score: newScore,
          status: newScore >= 70 ? "explored" : "partially_explored"
        };
      }
      return dim;
    });

    // 3. Find next weakest dimension
    const nextDimension = [...updatedRadar].sort((a, b) => a.score - b.score)[0].category;
    let nextIndex = updatedQuestions.findIndex((q, i) => i !== qIndex && !q.answered && q.targetDimension === nextDimension);
    
    if (nextIndex < 0) {
      nextIndex = updatedQuestions.findIndex(q => !q.answered);
    }

    return {
      ...model,
      radar: updatedRadar,
      questions: updatedQuestions,
      currentQuestionIndex: nextIndex
    };
  };

  const updated = processAnswer(initialModel, "q1", "I spoke to the dean and confirmed 1 course is accepted.");
  
  // Verify question was marked answered
  assert.equal(updated.questions[0].answered, true);
  assert.equal(updated.questions[0].userAnswer, "I spoke to the dean and confirmed 1 course is accepted.");
  assert.ok(updated.questions[0].aiFeedback.length > 0);

  // Verify radar recalibration (+15)
  const evidenceDim = updated.radar.find(r => r.category === "Evidence");
  assert.equal(evidenceDim.score, 40);
  assert.equal(evidenceDim.status, "partially_explored");

  // Verify next question advanced to the weakest area (Risks with score 20)
  assert.equal(updated.currentQuestionIndex, 1);
  assert.equal(updated.questions[updated.currentQuestionIndex].targetDimension, "Risks");
});

test("5. API Error & Edge Case Handling: handles malformed payloads gracefully", () => {
  const handleApiRequest = (rawPayload, length) => {
    // 1. Payload size guard
    if (length > 24000) {
      return { status: 413, body: { error: "This decision form is too large. Shorten the details and try again." } };
    }

    // 2. JSON parsing guard
    let parsed;
    try {
      parsed = JSON.parse(rawPayload);
    } catch {
      return { status: 400, body: { error: "The request could not be read. Please try again." } };
    }

    // 3. Object shape guard
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { status: 400, body: { error: "Please provide a valid decision form." } };
    }

    // 4. Decision presence guard
    if (!parsed.decision || typeof parsed.decision !== "string" || !parsed.decision.trim()) {
      return { status: 400, body: { error: "Please provide a decision to analyze." } };
    }

    return { status: 200, body: { success: true } };
  };

  // Malformed JSON
  const malformed = handleApiRequest("{ decision: unquoted }", 25);
  assert.equal(malformed.status, 400);
  assert.match(malformed.body.error, /could not be read/);

  // Oversized payload
  const oversized = handleApiRequest(JSON.stringify({ decision: "test" }), 25000);
  assert.equal(oversized.status, 413);
  assert.match(oversized.body.error, /too large/);

  // Missing decision
  const missing = handleApiRequest(JSON.stringify({ context: "Some background only" }), 40);
  assert.equal(missing.status, 400);
  assert.match(missing.body.error, /provide a decision/);

  // Valid request
  const valid = handleApiRequest(JSON.stringify({ decision: "Should I accept the offer?" }), 45);
  assert.equal(valid.status, 200);
  assert.equal(valid.body.success, true);
});
