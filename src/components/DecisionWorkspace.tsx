"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Target,
  EyeOff,
  BrainCircuit,
  HelpCircle,
  Users,
  GitBranch,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  AlertTriangle
} from "lucide-react";
import RadarChart from "./RadarChart";
import DecisionBrief from "./DecisionBrief";
import { StructuredDecisionModel } from "@/types/decision";

interface DecisionWorkspaceProps {
  initialModel: StructuredDecisionModel;
  onReset: () => void;
  onModelChange: (model: StructuredDecisionModel) => void;
}

type ActiveLens = "all" | "assumptions" | "evidence" | "alternatives" | "stakeholders" | "consequences" | "pre_mortem" | "blind_spots";

export default function DecisionWorkspace({ initialModel, onReset, onModelChange }: DecisionWorkspaceProps) {
  const [model, setModel] = useState<StructuredDecisionModel>(initialModel);
  const [activeLens, setActiveLens] = useState<ActiveLens>("all");
  const [selectedRadarCategory, setSelectedRadarCategory] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState(false);

  // Question state
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  useEffect(() => {
    onModelChange(model);
  }, [model, onModelChange]);

  const activeQuestion = model.questions[model.currentQuestionIndex] || model.questions[model.questions.length - 1];

  const handleSelectRadarCategory = (category: string) => {
    setSelectedRadarCategory(category);
    switch (category) {
      case "Assumptions":
        setActiveLens("assumptions");
        break;
      case "Evidence":
        setActiveLens("evidence");
        break;
      case "Alternatives":
        setActiveLens("alternatives");
        break;
      case "Stakeholders":
        setActiveLens("stakeholders");
        break;
      case "Risks":
        setActiveLens("pre_mortem");
        break;
      case "Consequences":
        setActiveLens("consequences");
        break;
      default:
        setActiveLens("all");
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim() || !activeQuestion) return;

    setIsSubmittingAnswer(true);
    setAnswerError(null);

    try {
      const res = await fetch("/api/answer-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          questionId: activeQuestion.id,
          answer: currentAnswer.trim()
        })
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || "Failed to submit answer.");
      }

      setModel(updated);
      setCurrentAnswer("");
    } catch (err: any) {
      setAnswerError(err.message || "Failed to submit answer.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleUpdateAssumptionTag = (id: string, tag: "confirmed_fact" | "still_assuming" | "untrue") => {
    setModel(prev => ({
      ...prev,
      assumptions: prev.assumptions.map(a => a.id === id ? { ...a, userVerification: tag } : a)
    }));
  };

  const handleUpdateReflection = (rating: string, note: string) => {
    setModel(prev => ({
      ...prev,
      reflection: {
        thinkingChangedRating: rating,
        thinkingChangedNote: note
      }
    }));
  };

  if (showBrief) {
    return (
      <DecisionBrief
        model={model}
        onBack={() => setShowBrief(false)}
        onUpdateReflection={handleUpdateReflection}
      />
    );
  }

  const answeredQuestions = model.questions.filter(q => q.answered);

  return (
    <div className="container" style={{ maxWidth: "1240px", margin: "0 auto", paddingBottom: "5rem" }}>
      {/* Top Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <button
          onClick={onReset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: "0.95rem"
          }}
        >
          <ArrowLeft size={16} /> Edit Decision Canvas
        </button>

        <button
          onClick={() => setShowBrief(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "var(--primary)",
            color: "#ffffff",
            border: "none",
            padding: "0.75rem 1.4rem",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: "var(--shadow-glow)",
            transition: "all 0.2s ease"
          }}
        >
          <FileText size={18} />
          <span>Generate Decision Brief</span>
        </button>
      </div>

      {/* Decision Summary Banner */}
      <div
        style={{
          background: "linear-gradient(180deg, var(--surface) 0%, rgba(78, 131, 255, 0.04) 100%)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem 2rem",
          marginBottom: "2rem"
        }}
      >
        <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
          Decision Laboratory Workspace
        </div>
        <h1 style={{ fontSize: "1.85rem", marginBottom: "0.75rem", lineHeight: 1.25 }}>
          {model.decision}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1rem", margin: 0 }}>
          {model.summary}
        </p>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Lenses & Analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Lens Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <LensPill active={activeLens === "all"} onClick={() => setActiveLens("all")} label="All Insights" />
            <LensPill active={activeLens === "assumptions"} onClick={() => setActiveLens("assumptions")} label={`Assumptions (${model.assumptions.length})`} />
            <LensPill active={activeLens === "evidence"} onClick={() => setActiveLens("evidence")} label="Evidence Lens" />
            <LensPill active={activeLens === "alternatives"} onClick={() => setActiveLens("alternatives")} label={`Alternatives (${model.alternatives.length})`} />
            <LensPill active={activeLens === "stakeholders"} onClick={() => setActiveLens("stakeholders")} label={`Stakeholders (${model.stakeholders.length})`} />
            <LensPill active={activeLens === "consequences"} onClick={() => setActiveLens("consequences")} label="Consequences & Reversibility" />
            <LensPill active={activeLens === "pre_mortem"} onClick={() => setActiveLens("pre_mortem")} label={`Pre-Mortem (${model.preMortem.length})`} />
            <LensPill active={activeLens === "blind_spots"} onClick={() => setActiveLens("blind_spots")} label={`Blind Spots (${model.blindSpots.length})`} />
          </div>

          {/* Section: Key Assumptions */}
          {(activeLens === "all" || activeLens === "assumptions") && (
            <SectionCard
              icon={<Target color="var(--warning)" size={22} />}
              title="Signature Feature 6: Assumption Cards"
              subtitle="Unstated assumptions detected in your premise. Click to tag your confidence."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {model.assumptions.map(assump => (
                  <div
                    key={assump.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.25rem"
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--foreground)", marginBottom: "0.5rem" }}>
                      {assump.assumption}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--foreground)" }}>Why it matters:</strong> {assump.whyItMatters}
                    </div>
                    <div
                      style={{
                        background: "rgba(78, 131, 255, 0.08)",
                        color: "var(--primary)",
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        marginBottom: "0.75rem"
                      }}
                    >
                      <BrainCircuit size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{assump.questionToVerify}</span>
                    </div>

                    {/* Interactive Tagging */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
                      <span>Your verdict:</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateAssumptionTag(assump.id, "confirmed_fact")}
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-sm)",
                          border: assump.userVerification === "confirmed_fact" ? "1px solid var(--success)" : "1px solid var(--border)",
                          background: assump.userVerification === "confirmed_fact" ? "rgba(78,255,140,0.15)" : "transparent",
                          color: assump.userVerification === "confirmed_fact" ? "var(--success)" : "var(--muted)",
                          cursor: "pointer"
                        }}
                      >
                        ✓ Verified Fact
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateAssumptionTag(assump.id, "still_assuming")}
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-sm)",
                          border: assump.userVerification === "still_assuming" ? "1px solid var(--warning)" : "1px solid var(--border)",
                          background: assump.userVerification === "still_assuming" ? "rgba(255,184,78,0.15)" : "transparent",
                          color: assump.userVerification === "still_assuming" ? "var(--warning)" : "var(--muted)",
                          cursor: "pointer"
                        }}
                      >
                        ? Still Assuming
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateAssumptionTag(assump.id, "untrue")}
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-sm)",
                          border: assump.userVerification === "untrue" ? "1px solid var(--danger)" : "1px solid var(--border)",
                          background: assump.userVerification === "untrue" ? "rgba(255,78,78,0.15)" : "transparent",
                          color: assump.userVerification === "untrue" ? "var(--danger)" : "var(--muted)",
                          cursor: "pointer"
                        }}
                      >
                        ✕ Untrue / Invalid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Section: Evidence Lens */}
          {(activeLens === "all" || activeLens === "evidence") && (
            <SectionCard
              icon={<Sparkles color="var(--primary)" size={22} />}
              title="Signature Feature 7: Evidence Lens"
              subtitle="Separating what you KNOW from what you BELIEVE and what needs VERIFICATION."
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <EvidenceBox title="What do I KNOW? (Facts)" items={model.evidence.facts} color="var(--success)" />
                <EvidenceBox title="What do I BELIEVE? (Subjective)" items={model.evidence.beliefs} color="var(--warning)" />
                <EvidenceBox title="What am I ASSUMING?" items={model.evidence.assumptions} color="var(--primary)" />
                <EvidenceBox title="What must I VERIFY?" items={model.evidence.needsVerification} color="var(--danger)" />
              </div>
            </SectionCard>
          )}

          {/* Section: Alternative Lens */}
          {(activeLens === "all" || activeLens === "alternatives") && (
            <SectionCard
              icon={<GitBranch color="var(--primary)" size={22} />}
              title="Signature Feature 8: Alternative Lens"
              subtitle="Uncovering unconsidered options, hybrid paths, low-risk tests, and reversible fallbacks."
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {model.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.2rem"
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700, marginBottom: "0.35rem" }}>
                      {alt.type}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.4rem" }}>
                      {alt.title}
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.4, margin: "0 0 0.5rem 0" }}>
                      {alt.description}
                    </p>
                    <div style={{ fontSize: "0.82rem", color: "var(--warning)" }}>
                      <strong>Tradeoff:</strong> {alt.tradeoff}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Section: Stakeholder Lens */}
          {(activeLens === "all" || activeLens === "stakeholders") && (
            <SectionCard
              icon={<Users color="var(--primary)" size={22} />}
              title="Signature Feature 9: Stakeholder Lens"
              subtitle="Who else is affected by this decision? Looking beyond immediate self-interest."
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {model.stakeholders.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.2rem"
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--foreground)", marginBottom: "0.35rem" }}>
                      {s.group}
                    </div>
                    <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: "0 0 0.5rem 0", lineHeight: 1.4 }}>
                      {s.impact}
                    </p>
                    <div style={{ fontSize: "0.82rem", color: "var(--primary)" }}>
                      <strong>Often Overlooked:</strong> {s.oftenOverlookedAspect}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Section: Consequences & Reversibility */}
          {(activeLens === "all" || activeLens === "consequences") && (
            <SectionCard
              icon={<GitBranch color="var(--primary)" size={22} />}
              title="Signature Features 10 & 11: Consequences & Reversibility"
              subtitle="Second-order effects (Immediate -> Secondary -> Unintended) and decision reversibility."
            >
              {/* Reversibility Banner */}
              <div
                style={{
                  background: "rgba(78, 131, 255, 0.06)",
                  border: "1px solid rgba(78, 131, 255, 0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.2rem",
                  marginBottom: "1.5rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Reversibility Tier</span>
                  <span
                    style={{
                      background: "var(--primary)",
                      color: "#fff",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    {model.reversibility.rating}
                  </span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0 0 0.5rem 0" }}>
                  {model.reversibility.explanation}
                </p>
                <div style={{ fontSize: "0.85rem", color: "var(--foreground)" }}>
                  <strong>Rollback Strategy:</strong> {model.reversibility.rollbackStrategy}
                </div>
              </div>

              {/* Consequence Chains */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {model.consequences.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.2rem"
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.75rem" }}>
                      Branch: {c.decisionBranch}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)", marginBottom: "0.25rem" }}>1. Immediate</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{c.immediate}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--warning)", marginBottom: "0.25rem" }}>2. Secondary (6-12 mo)</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{c.secondary}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--danger)", marginBottom: "0.25rem" }}>3. Possible Unintended</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{c.unintended}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Section: Pre-Mortem */}
          {(activeLens === "all" || activeLens === "pre_mortem") && (
            <SectionCard
              icon={<Flame color="var(--danger)" size={22} />}
              title="Signature Feature 12: Pre-Mortem"
              subtitle="'Imagine you made this decision 6 months ago and it went badly. What caused the failure?'"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {model.preMortem.map((pm, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255, 78, 78, 0.04)",
                      border: "1px solid rgba(255, 78, 78, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.25rem"
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "#fff", marginBottom: "0.5rem" }}>
                      {pm.failureScenario}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "0.4rem" }}>
                      <strong>Why it could happen:</strong> {pm.rootCauseWhy}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--warning)", marginBottom: "0.4rem" }}>
                      <strong>Early warning signal:</strong> {pm.earlyWarningSignal}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--success)" }}>
                      <strong>Proactive mitigation:</strong> {pm.mitigatingAction}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Section: Blind Spot Cards */}
          {(activeLens === "all" || activeLens === "blind_spots") && (
            <SectionCard
              icon={<EyeOff color="var(--danger)" size={22} />}
              title="Signature Feature 13: Blind Spot Cards"
              subtitle="Crucial omissions, information asymmetries, and invisible workloads identified in your reasoning."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {model.blindSpots.map((spot, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderLeft: "4px solid var(--danger)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.25rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--danger)", fontWeight: 700 }}>
                        {spot.category}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                      {spot.title}
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0 0 0.5rem 0", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--foreground)" }}>Why it may matter:</strong> {spot.whyItMatters}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0 0 0.75rem 0", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--foreground)" }}>What is currently unknown:</strong> {spot.whatIsUnknown}
                    </p>
                    <div style={{ color: "var(--primary)", fontSize: "0.9rem", fontStyle: "italic" }}>
                      "{spot.questionToExamine}"
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

        </div>

        {/* Right Column: Radar & Adaptive Questioning */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "sticky", top: "1rem" }}>
          
          {/* Signature Feature 4: Blind Spot Radar */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>
                Blind Spot Radar
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Click category</span>
            </div>

            <RadarChart
              dimensions={model.radar}
              selectedCategory={selectedRadarCategory}
              onSelectDimension={handleSelectRadarCategory}
            />

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem", fontSize: "0.75rem", color: "var(--muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5555" }} />
                <span>Needs Attention</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffb84e" }} />
                <span>Partially Explored</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4eff8c" }} />
                <span>Explored</span>
              </div>
            </div>
          </div>

          {/* Signature Feature 5: Adaptive Questioning Panel */}
          <div
            style={{
              background: "linear-gradient(180deg, var(--surface) 0%, rgba(78, 131, 255, 0.05) 100%)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.75rem" }}>
              <HelpCircle size={18} />
              <span>Adaptive Questioning</span>
            </div>

            {activeQuestion ? (
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  Targeting: <strong style={{ color: "var(--foreground)" }}>{activeQuestion.targetDimension}</strong>
                </div>

                <p style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: 1.45, marginBottom: "0.75rem", color: "#ffffff" }}>
                  "{activeQuestion.question}"
                </p>

                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.4 }}>
                  <em>Why this matters now:</em> {activeQuestion.reasoningContext}
                </p>

                {answerError && (
                  <div role="alert" style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                    {answerError}
                  </div>
                )}

                <textarea
                  aria-label="Your response to the current question"
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder="Answer thoughtfully to update your thinking radar..."
                  rows={4}
                  style={{ width: "100%", resize: "vertical", fontSize: "0.95rem", marginBottom: "0.75rem" }}
                />

                <button
                  onClick={handleAnswerSubmit}
                  disabled={isSubmittingAnswer || !currentAnswer.trim()}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: currentAnswer.trim() ? "var(--primary)" : "var(--surface-hover)",
                    color: currentAnswer.trim() ? "#fff" : "var(--muted)",
                    border: "none",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    cursor: currentAnswer.trim() && !isSubmittingAnswer ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease"
                  }}
                >
                  {isSubmittingAnswer ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>Updating Reasoning Model...</span>
                    </>
                  ) : (
                    <span>Submit Answer & Update Model</span>
                  )}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--muted)", padding: "1rem 0" }}>
                All load-bearing questions explored! Ready to generate your Decision Brief.
              </div>
            )}

            {/* Answered Questions History */}
            {answeredQuestions.length > 0 && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600, marginBottom: "0.75rem" }}>
                  Answered Inquiries ({answeredQuestions.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {answeredQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.75rem"
                      }}
                    >
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff", marginBottom: "0.25rem" }}>
                        Q: {q.question}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.35rem" }}>
                        <strong>A:</strong> {q.userAnswer}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--success)" }}>
                        ✓ {q.aiFeedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

function LensPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "0.45rem 0.9rem",
        borderRadius: "var(--radius-xl)",
        border: active ? "1px solid var(--primary)" : "1px solid var(--border)",
        background: active ? "rgba(78, 131, 255, 0.15)" : "var(--surface)",
        color: active ? "#ffffff" : "var(--muted)",
        fontSize: "0.85rem",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
    >
      {label}
    </button>
  );
}

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.75rem",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
        {icon}
        <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
          {title}
        </h2>
      </div>
      {subtitle && (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0 0 1.25rem 0" }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

function EvidenceBox({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "1rem"
      }}
    >
      <div style={{ fontSize: "0.85rem", fontWeight: 700, color, textTransform: "uppercase", marginBottom: "0.5rem" }}>
        {title}
      </div>
      <ul style={{ paddingLeft: "1.1rem", margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: "0.25rem", lineHeight: 1.4 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
