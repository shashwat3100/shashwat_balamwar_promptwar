import { GoogleGenAI } from "@google/genai";
import { StructuredDecisionModel, AdaptiveQuestion } from "@/types/decision";

interface AnalyzeParams {
  decision: string;
  context?: string;
  options?: string;
  goals?: string;
  constraints?: string;
  deadline?: string;
}

export async function analyzeDecisionWithGemini(params: AnalyzeParams): Promise<StructuredDecisionModel> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are the reasoning engine of "BLIND SPOT", an AI thinking partner.
The core tenet is: NEVER MAKE THE DECISION FOR THE USER. NEVER say "You should choose X".
Your role is to help the user discover what they overlooked: unstated assumptions, missing evidence, alternatives, stakeholders, second-order effects, reversibility, and pre-mortem failure modes.

USER DECISION CONTEXT:
- Decision: "${params.decision}"
- Context/Background: "${params.context || "Not provided"}"
- Options being considered: "${params.options || "Not provided"}"
- Core Goals: "${params.goals || "Not provided"}"
- Constraints: "${params.constraints || "Not provided"}"
- Deadline: "${params.deadline || "None specified"}"

Return ONLY a valid JSON object matching the following structure:
{
  "summary": "1-sentence objective distillation of the decision",
  "radar": [
    { "category": "Evidence", "score": 45, "status": "needs_attention", "statusLabel": "Needs Verification", "whyNeedsAttention": "explanation" },
    { "category": "Assumptions", "score": 35, "status": "needs_attention", "statusLabel": "Heavy Reliance", "whyNeedsAttention": "explanation" },
    { "category": "Alternatives", "score": 60, "status": "partially_explored", "statusLabel": "Partially Explored", "whyNeedsAttention": "explanation" },
    { "category": "Stakeholders", "score": 40, "status": "needs_attention", "statusLabel": "Unexplored Groups", "whyNeedsAttention": "explanation" },
    { "category": "Risks", "score": 50, "status": "partially_explored", "statusLabel": "Surface-Level Risks", "whyNeedsAttention": "explanation" },
    { "category": "Consequences", "score": 40, "status": "needs_attention", "statusLabel": "Second-Order Gaps", "whyNeedsAttention": "explanation" }
  ],
  "assumptions": [
    {
      "id": "a1",
      "assumption": "You appear to be assuming that...",
      "whyItMatters": "Load-bearing impact on reasoning...",
      "questionToVerify": "Probing question to test this assumption..."
    }
  ],
  "evidence": {
    "facts": ["What is verifiable from the input"],
    "beliefs": ["Subjective beliefs stated as truth"],
    "assumptions": ["Implicit assumptions identified"],
    "needsVerification": ["Crucial data points that require external confirmation"]
  },
  "alternatives": [
    {
      "type": "Alternative Option",
      "title": "Title",
      "description": "Novel option not mentioned",
      "tradeoff": "Key tradeoff"
    },
    {
      "type": "Hybrid Approach",
      "title": "Title",
      "description": "Combine the upside of both paths",
      "tradeoff": "Key tradeoff"
    },
    {
      "type": "Low-Risk Micro-Experiment",
      "title": "Title",
      "description": "Small test before full commitment",
      "tradeoff": "Key tradeoff"
    },
    {
      "type": "Reversible Fallback",
      "title": "Title",
      "description": "Safe exit pathway",
      "tradeoff": "Key tradeoff"
    }
  ],
  "stakeholders": [
    {
      "group": "Self",
      "impact": "Direct day-to-day impact",
      "oftenOverlookedAspect": "Often overlooked emotional or mental load"
    },
    {
      "group": "Family",
      "impact": "Impact on loved ones / lifestyle",
      "oftenOverlookedAspect": "Subtle second-order effect"
    },
    {
      "group": "Future Self",
      "impact": "1-3 year horizon impact",
      "oftenOverlookedAspect": "Career optionality or compounding fatigue"
    }
  ],
  "consequences": [
    {
      "decisionBranch": "Primary choice considered",
      "immediate": "What happens in the first 30 days",
      "secondary": "What happens in 6-12 months",
      "unintended": "Possible unexpected consequence"
    }
  ],
  "reversibility": {
    "rating": "Moderately Reversible",
    "explanation": "Why this decision falls into this reversibility tier",
    "rollbackStrategy": "Concrete way to walk this back if it fails"
  },
  "preMortem": [
    {
      "failureScenario": "Imagine 6 months from now this turned out badly...",
      "rootCauseWhy": "Plausible hidden vulnerability that caused it",
      "earlyWarningSignal": "Signal you'd notice in week 3-4 that indicates failure is approaching",
      "mitigatingAction": "Concrete guardrail to put in place now"
    }
  ],
  "blindSpots": [
    {
      "title": "Short label",
      "category": "Evidence",
      "whyItMatters": "Why this omission is critical",
      "whatIsUnknown": "What data is currently missing",
      "questionToExamine": "Thoughtful inquiry for the user"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "question": "First load-bearing adaptive question",
      "reasoningContext": "Why this specific question is the highest leverage inquiry right now",
      "targetDimension": "Assumptions"
    },
    {
      "id": "q2",
      "question": "Second adaptive question",
      "reasoningContext": "Examining evidence and verification",
      "targetDimension": "Evidence"
    },
    {
      "id": "q3",
      "question": "Third adaptive question exploring second-order effects",
      "reasoningContext": "Long-term consequence probe",
      "targetDimension": "Consequences"
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          decision: params.decision,
          summary: parsed.summary || "Structured decision model",
          context: params.context || "",
          options: params.options ? params.options.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : ["Option A", "Option B"],
          goals: params.goals ? params.goals.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : ["Clarity", "Growth"],
          constraints: params.constraints ? params.constraints.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : [],
          radar: parsed.radar || buildDefaultRadar(),
          assumptions: parsed.assumptions || [],
          evidence: parsed.evidence || { facts: [], beliefs: [], assumptions: [], needsVerification: [] },
          alternatives: parsed.alternatives || [],
          stakeholders: parsed.stakeholders || [],
          consequences: parsed.consequences || [],
          reversibility: parsed.reversibility || {
            rating: "Moderately Reversible",
            explanation: "Can be reversed with deliberate notice and transition planning.",
            rollbackStrategy: "Set milestones to review at 60 and 90 days."
          },
          preMortem: parsed.preMortem || [],
          blindSpots: parsed.blindSpots || [],
          questions: (parsed.questions || []).map((q: any, i: number) => ({ ...q, id: q.id || `q${i + 1}`, answered: false })),
          currentQuestionIndex: 0
        };
      }
    } catch (err) {
      console.warn("Gemini API call failed or rate-limited; falling back to heuristic reasoning engine:", err);
    }
  }

  // Graceful Heuristic Fallback Engine
  return generateHeuristicReasoning(params);
}

function buildDefaultRadar() {
  return [
    { category: "Evidence", score: 45, status: "needs_attention", statusLabel: "Needs Verification", whyNeedsAttention: "Crucial external validation points remain unverified." },
    { category: "Assumptions", score: 35, status: "needs_attention", statusLabel: "Heavy Unexamined Reliance", whyNeedsAttention: "Decision premise hinges on multiple unstated assumptions." },
    { category: "Alternatives", score: 55, status: "partially_explored", statusLabel: "Partially Explored", whyNeedsAttention: "Narrow option framing overlooks hybrid or phased approaches." },
    { category: "Stakeholders", score: 40, status: "needs_attention", statusLabel: "Unexplored Impact", whyNeedsAttention: "Impact on secondary stakeholders or future self has not been mapped." },
    { category: "Risks", score: 50, status: "partially_explored", statusLabel: "Surface-Level Awareness", whyNeedsAttention: "Downside scenarios and tail risks lack contingency plans." },
    { category: "Consequences", score: 40, status: "needs_attention", statusLabel: "Second-Order Gaps", whyNeedsAttention: "Focus is on immediate payoffs rather than 6-12 month repercussions." }
  ];
}

export function generateHeuristicReasoning(params: AnalyzeParams): StructuredDecisionModel {
  const dec = params.decision.trim();
  const ctx = (params.context || "").trim();
  const opt = (params.options || "").trim();
  const goals = (params.goals || "").trim();
  const constraints = (params.constraints || "").trim();

  // Extract key topics
  const hasMoney = /money|salary|cost|financial|stipend|equity|pay|expense/i.test(`${dec} ${ctx} ${goals}`);
  const hasCareer = /job|role|career|internship|promotion|startup|company|work|boss/i.test(`${dec} ${ctx}`);
  const hasLocation = /move|relocat|city|home|remote|commute/i.test(`${dec} ${ctx} ${constraints}`);

  const optionsList = opt ? opt.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : [
    "Proceed with primary path",
    "Maintain status quo / defer"
  ];

  const goalsList = goals ? goals.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : [
    "Maximize long-term personal & professional trajectory",
    "Minimize regret and protect downside"
  ];

  const constraintsList = constraints ? constraints.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) : [
    "Time sensitivity",
    "Resource allocation"
  ];

  return {
    decision: dec,
    summary: `Evaluating whether to commit to "${dec}" against baseline alternatives while balancing stated priorities.`,
    context: ctx,
    options: optionsList,
    goals: goalsList,
    constraints: constraintsList,
    radar: [
      { category: "Evidence", score: 40, status: "needs_attention", statusLabel: "Needs Verification", whyNeedsAttention: "Key assertions rest on subjective optimism rather than hard, verified evidence." },
      { category: "Assumptions", score: 30, status: "needs_attention", statusLabel: "Heavy Assumption Burden", whyNeedsAttention: "Assumes conditions (culture, workload, growth trajectory) will match expectations without empirical data." },
      { category: "Alternatives", score: 50, status: "partially_explored", statusLabel: "Binary Framing", whyNeedsAttention: "Current framing is largely 'either/or', missing hybrid or small-test alternatives." },
      { category: "Stakeholders", score: 35, status: "needs_attention", statusLabel: "Narrow Lens", whyNeedsAttention: "Impact on secondary peers, mentors, family, and future-self burnout remains unmapped." },
      { category: "Risks", score: 45, status: "needs_attention", statusLabel: "Optimism Bias", whyNeedsAttention: "Early warning indicators and low-probability downside scenarios haven't been stress-tested." },
      { category: "Consequences", score: 40, status: "needs_attention", statusLabel: "Second-Order Blindness", whyNeedsAttention: "Immediate benefits are front-of-mind, while 6-month cascading dependencies are overlooked." }
    ],
    assumptions: [
      {
        id: "a1",
        assumption: hasMoney 
          ? "You appear to be assuming that the financial compensation will sufficiently offset hidden operational or living costs."
          : "You appear to be assuming that the promised upside will materialize without demanding disproportionate tradeoffs in other life areas.",
        whyItMatters: "If net conditions (burnout, hidden expenses, culture mismatch) worsen, the primary justification for this decision dissolves.",
        questionToVerify: "What specific objective metric will tell you 90 days in whether this assumption holds true?"
      },
      {
        id: "a2",
        assumption: "You appear to be assuming that the current baseline opportunity will remain available or that staying still carries zero hidden risk.",
        whyItMatters: "Inaction bias often treats the status quo as risk-free, while opportunity cost silently accumulates.",
        questionToVerify: "What is the cost of NOT making this move over a 2-year timeline?"
      },
      {
        id: "a3",
        assumption: "You appear to be assuming that you possess complete visibility into the day-to-day realities of this path.",
        whyItMatters: "Decisions made from marketing/pitch descriptions frequently clash with actual ground-level operational friction.",
        questionToVerify: "Have you spoken with someone who exited or took this exact path within the last 12 months?"
      }
    ],
    evidence: {
      facts: [
        dec,
        ...(ctx ? [`Stated background: ${ctx.slice(0, 120)}...`] : ["Baseline intent established"]),
        ...(constraintsList.length ? [`Identified constraints: ${constraintsList.join(", ")}`] : [])
      ],
      beliefs: [
        "Belief that this choice offers superior career velocity or personal fulfillment",
        "Belief that external factors will remain stable throughout the execution window"
      ],
      assumptions: [
        "Assumption that day-to-day culture and expectations align with initial appearances",
        "Assumption that the required sacrifice is sustainable without compromising health or relationships"
      ],
      needsVerification: [
        "Unvarnished testimonials from third parties with no incentive to sell you on this path",
        "Total all-in hidden cost / time accounting (commute, tax, unpaid overhead, emotional drain)",
        "Clear contractual or formal terms vs verbal assurances"
      ]
    },
    alternatives: [
      {
        type: "Alternative Option",
        title: "The Targeted Counter-Proposal",
        description: "Instead of accepting the binary offer, negotiate modified terms (hybrid schedule, defined milestones, or mentorship guarantees) that eliminate your greatest concern.",
        tradeoff: "Requires upfront assertiveness and may surface misaligned counterpart expectations."
      },
      {
        type: "Hybrid Approach",
        title: "The Staged Commitment",
        description: "Commit on a provisional or trial basis (e.g., 3-month review clause or moonlighting pilot) before making a permanent structural pivot.",
        tradeoff: "Splits initial focus but protects downside dramatically."
      },
      {
        type: "Low-Risk Micro-Experiment",
        title: "Pre-Commitment Shadow Test",
        description: "Spend 2-3 intensive days simulating the exact working conditions, commute, or deliverables before signing or committing.",
        tradeoff: "Demands immediate effort but reveals immediate ground truth."
      },
      {
        type: "Reversible Fallback",
        title: "The Defined Off-Ramp",
        description: "Write down your non-negotiable exit triggers right now. If trigger X occurs by month 4, initiate predetermined backup plan Y.",
        tradeoff: "Prevents escalating commitment and sunk-cost fallacy."
      }
    ],
    stakeholders: [
      {
        group: "Self",
        impact: "Direct transformation of weekly routine, cognitive load, and sense of purpose.",
        oftenOverlookedAspect: "The silent depletion of creative energy or leisure if boundaries blur."
      },
      {
        group: "Family",
        impact: "Proximity, emotional presence, and indirect dependence on your stability.",
        oftenOverlookedAspect: "How your stress levels will inevitably spill over into interpersonal relationships."
      },
      {
        group: "Team & Peers",
        impact: "Altered dynamic, handover burdens, or changed collaborative expectations.",
        oftenOverlookedAspect: "Unspoken relational capital lost or gained during transition."
      },
      {
        group: "Future Self",
        impact: "The compounding skills, resume signal, and psychological resilience acquired.",
        oftenOverlookedAspect: "Whether this path builds durable career optionality or creates narrow specialization."
      }
    ],
    consequences: [
      {
        decisionBranch: "Proceeding with primary decision",
        immediate: "Surge of novelty and initial orientation effort (Weeks 1-4).",
        secondary: "Realization of true unstated demands, team velocity, or friction points (Months 3-6).",
        unintended: "Possible neglect of secondary goals (health, independent projects, side relationships) due to tunnel vision."
      },
      {
        decisionBranch: "Choosing status quo / rejection",
        immediate: "Relief from immediate uncertainty and disruption.",
        secondary: "Potential creeping frustration, stagnation feelings, or regret when encountering obstacles in the current setting.",
        unintended: "Inadvertently signaling lack of ambition or reluctance to embrace calculated risk."
      }
    ],
    reversibility: {
      rating: "Moderately Reversible",
      explanation: "While social and time capital will be consumed, skills and relationships can be redirected if you construct an intentional off-ramp within the first 90 days.",
      rollbackStrategy: "Maintain warm relationships with current mentors/peers, keep emergency reserves untouched, and schedule a hard 90-day self-audit."
    },
    preMortem: [
      {
        failureScenario: "Scenario: 6 months in, you feel isolated, overworked, and realize the actual learning and support are vastly below what was discussed.",
        rootCauseWhy: "Relying on high-level promotional conversations during the courtship phase rather than auditing daily team workflows.",
        earlyWarningSignal: "In week 3, recurring requests for guidance or onboarding support are dismissed or indefinitely deferred.",
        mitigatingAction: "Schedule a formal 30-day alignment review right at the start to establish explicit expectations."
      },
      {
        failureScenario: "Scenario: Burnout and schedule collision with foundational commitments (academics, health, family).",
        rootCauseWhy: "Underestimating the cognitive friction of context-switching and overestimating your daily reserve capacity.",
        earlyWarningSignal: "Consistently working during protected weekend or rest hours to maintain baseline competence.",
        mitigatingAction: "Set hard non-negotiable boundary hours now and communicate them proactively."
      }
    ],
    blindSpots: [
      {
        title: "The 'Invisible Workload' Gap",
        category: "Consequences",
        whyItMatters: "Onboarding and establishing credibility in any new setting takes 30-50% more cognitive energy than anticipated.",
        whatIsUnknown: "The actual weekly administrative and context-switching overhead required.",
        questionToExamine: "How will your schedule absorb an extra 10 hours a week of unrecorded mental friction?"
      },
      {
        title: "Asymmetric Information Asymmetry",
        category: "Evidence",
        whyItMatters: "The counterparty knows their internal dysfunctions, but you only see their curated pitch.",
        whatIsUnknown: "Employee turnover rates, actual team morale, and past promise fulfillment.",
        questionToExamine: "What uncomfortable question have you hesitated to ask the counterparty for fear of appearing difficult?"
      },
      {
        title: "Opportunity Cost of the Next Best Thing",
        category: "Alternatives",
        whyItMatters: "Comparing Option A to Option B ignores Options C, D, and E that haven't been sought out.",
        whatIsUnknown: "What high-leverage opportunities you might unlock if you spent 2 weeks actively hunting alternatives.",
        questionToExamine: "If neither of your current options existed, what bold alternative would you pursue tomorrow?"
      }
    ],
    questions: [
      {
        id: "q1",
        question: "What is the single most load-bearing piece of evidence you are relying on that you have not independently verified with an impartial third party?",
        reasoningContext: "Decisions frequently stumble when attractive claims are accepted on faith during early enthusiasm.",
        targetDimension: "Evidence"
      },
      {
        id: "q2",
        question: "If this path turns out to demand 40% more effort for 20% less return than expected, how does that alter your commitment?",
        reasoningContext: "Stress-testing your resilience against expectation disillusionment.",
        targetDimension: "Risks"
      },
      {
        id: "q3",
        question: "Who in your immediate circle will bear the collateral cost of this decision if things become stressful, and have you consulted them?",
        reasoningContext: "Uncovering interpersonal externalities and relational blind spots.",
        targetDimension: "Stakeholders"
      }
    ],
    currentQuestionIndex: 0
  };
}

export async function processAdaptiveAnswer(
  currentModel: StructuredDecisionModel,
  questionId: string,
  answer: string
): Promise<StructuredDecisionModel> {
  const currentQIndex = currentModel.questions.findIndex(q => q.id === questionId);
  const targetDimension = currentQIndex >= 0 ? currentModel.questions[currentQIndex].targetDimension : "Evidence";

  // Update question state
  const updatedQuestions = [...currentModel.questions];
  if (currentQIndex >= 0) {
    updatedQuestions[currentQIndex] = {
      ...updatedQuestions[currentQIndex],
      answered: true,
      userAnswer: answer,
      aiFeedback: `Analyzed your response regarding ${targetDimension.toLowerCase()}. Your reflection incorporates new nuances into the decision canvas.`
    };
  }

  // Update Radar scores: increase explored level for target dimension and adjust status
  const updatedRadar = currentModel.radar.map(dim => {
    if (dim.category === targetDimension) {
      const newScore = Math.min(95, dim.score + 25);
      return {
        ...dim,
        score: newScore,
        status: (newScore >= 70 ? "explored" : "partially_explored") as any,
        statusLabel: newScore >= 70 ? "Thoroughly Examined" : "Partially Explored",
        whyNeedsAttention: newScore >= 70 
          ? "You have articulated thoughtful answers that clarify this dimension." 
          : "Initial blind spots acknowledged; continued vigilance recommended."
      };
    }
    return dim;
  });

  // Advance question index
  const nextIndex = currentQIndex + 1;

  // If we ran out of questions, generate a dynamic follow-up question
  if (nextIndex >= updatedQuestions.length) {
    updatedQuestions.push({
      id: `q${updatedQuestions.length + 1}`,
      question: "Looking back at the uncertainties and trade-offs you've articulated, what is one concrete boundary you must establish before taking your first irreversible step?",
      reasoningContext: "Translating discovered blind spots into personal guardrails.",
      targetDimension: "Risks",
      answered: false
    });
  }

  return {
    ...currentModel,
    radar: updatedRadar,
    questions: updatedQuestions,
    currentQuestionIndex: nextIndex
  };
}
