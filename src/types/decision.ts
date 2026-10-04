export type RadarStatus = "unexplored" | "partially_explored" | "explored" | "needs_attention";

export interface RadarDimension {
  category: "Evidence" | "Assumptions" | "Alternatives" | "Stakeholders" | "Risks" | "Consequences";
  score: number; // 0 to 100
  status: RadarStatus;
  statusLabel: string;
  whyNeedsAttention: string;
}

export interface AssumptionCard {
  id: string;
  assumption: string;
  whyItMatters: string;
  questionToVerify: string;
  userVerification?: "confirmed_fact" | "still_assuming" | "untrue";
}

export interface EvidenceClassification {
  facts: string[];
  beliefs: string[];
  assumptions: string[];
  needsVerification: string[];
}

export interface AlternativeItem {
  type: "Alternative Option" | "Hybrid Approach" | "Delay & Gather Info" | "Low-Risk Micro-Experiment" | "Reversible Fallback";
  title: string;
  description: string;
  tradeoff: string;
}

export interface StakeholderImpact {
  group: "Self" | "Family" | "Team & Peers" | "Customers / Clients" | "Organization" | "Future Self";
  impact: string;
  oftenOverlookedAspect: string;
}

export interface ConsequenceChain {
  decisionBranch: string;
  immediate: string;
  secondary: string;
  unintended: string;
}

export interface ReversibilityAnalysis {
  rating: "Easily Reversible (Type 2)" | "Moderately Reversible" | "Difficult to Reverse (Type 1 - One-Way Door)";
  explanation: string;
  rollbackStrategy: string;
}

export interface PreMortemScenario {
  failureScenario: string;
  rootCauseWhy: string;
  earlyWarningSignal: string;
  mitigatingAction: string;
}

export interface BlindSpotCard {
  title: string;
  category: "Evidence" | "Assumptions" | "Alternatives" | "Stakeholders" | "Risks" | "Consequences";
  whyItMatters: string;
  whatIsUnknown: string;
  questionToExamine: string;
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  reasoningContext: string;
  targetDimension: "Evidence" | "Assumptions" | "Alternatives" | "Stakeholders" | "Risks" | "Consequences";
  answered?: boolean;
  userAnswer?: string;
  aiFeedback?: string;
}

export interface StructuredDecisionModel {
  decision: string;
  summary: string;
  context: string;
  options: string[];
  goals: string[];
  constraints: string[];
  radar: RadarDimension[];
  assumptions: AssumptionCard[];
  evidence: EvidenceClassification;
  alternatives: AlternativeItem[];
  stakeholders: StakeholderImpact[];
  consequences: ConsequenceChain[];
  reversibility: ReversibilityAnalysis;
  preMortem: PreMortemScenario[];
  blindSpots: BlindSpotCard[];
  questions: AdaptiveQuestion[];
  currentQuestionIndex: number;
  reflection?: {
    thinkingChangedRating?: string;
    thinkingChangedNote?: string;
  };
}
