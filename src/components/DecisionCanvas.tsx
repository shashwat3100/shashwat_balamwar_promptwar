"use client";

import { useState } from "react";
import { Play, Sparkles, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { StructuredDecisionModel } from "@/types/decision";

interface DecisionCanvasProps {
  onAnalysisComplete: (model: StructuredDecisionModel) => void;
}

const PRESET_SCENARIOS = [
  {
    tag: "Competition Example",
    title: "6-Month Internship vs College Schedule",
    decision: "Should I accept a 6-month full-time internship offer at a local tech company or prioritize my regular college coursework and degree timeline?",
    context: "I'm a 3rd-year student. The company is 20 minutes from my home and offers a solid monthly stipend. However, the university does not officially give academic credits for outside internships, which might delay my graduation by a semester or require overload courses.",
    options: "Option 1: Accept the 6-month internship full-time and take a leave of absence for a semester.\nOption 2: Reject the offer and focus 100% on academic grades and campus projects.\nOption 3: Negotiate part-time hours (20h/week) while taking a lighter college course load.",
    goals: "Gain real-world engineering experience, earn stipend income, but graduate without wrecking GPA or missing critical prerequisites.",
    constraints: "Need to accept or decline the offer within 5 days. Must graduate within 1.5 years to honor family expectations.",
    deadline: "Friday 5:00 PM"
  },
  {
    tag: "Career Pivot",
    title: "Seed-Stage Startup vs Corporate Senior Role",
    decision: "Should I leave my stable corporate engineering job to join an early-stage AI startup as Founding Engineer?",
    context: "I have been at my current company for 4 years. Culture is predictable and compensation is high, but learning has plateaued. The startup just raised a $3M seed round and offered me 1.5% equity with a 25% base pay cut.",
    options: "Option A: Join the startup as Founding Engineer.\nOption B: Stay at corporate and push for Engineering Manager promotion.\nOption C: Stay, but advise the startup on weekends.",
    goals: "Accelerate technical velocity, build high equity upside, avoid cognitive stagnation.",
    constraints: "Have a mortgage and 8 months of living expenses in emergency reserve. Spouse prefers predictability.",
    deadline: "Within 2 weeks"
  },
  {
    tag: "Life & Relocation",
    title: "Moving Cities for Career Growth",
    decision: "Should I relocate across the country to a major tech hub or continue working remotely from my hometown?",
    context: "Remote work is comfortable and cost of living is low, but all executive decisions happen at HQ. Being on-site might unlock faster mentorship and network serendipity.",
    options: "Option 1: Relocate full-time.\nOption 2: Stay remote and travel to HQ 1 week every two months.\nOption 3: Look for a remote company that is 100% distributed with no HQ bias.",
    goals: "Career acceleration without destroying quality of life or friendships.",
    constraints: "Relocation allowance provided, but rent will double.",
    deadline: "Next month"
  }
];

export default function DecisionCanvas({ onAnalysisComplete }: DecisionCanvasProps) {
  const [formData, setFormData] = useState({
    decision: "",
    context: "",
    options: "",
    goals: "",
    constraints: "",
    deadline: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setFormData({
      decision: preset.decision,
      context: preset.context,
      options: preset.options,
      goals: preset.goals,
      constraints: preset.constraints,
      deadline: preset.deadline
    });
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.decision.trim()) {
      setError("Please describe the decision you are considering.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze decision.");
      }

      onAnalysisComplete(data);
    } catch (err: any) {
      setError(err?.message || "Failed to analyze decision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 0.9rem",
            background: "rgba(78, 131, 255, 0.1)",
            border: "1px solid rgba(78, 131, 255, 0.25)",
            color: "var(--primary)",
            borderRadius: "var(--radius-xl)",
            fontSize: "0.85rem",
            fontWeight: 500,
            marginBottom: "1rem"
          }}
        >
          <Sparkles size={15} />
          <span>Decision Laboratory & Thinking Companion</span>
        </div>
        <h1 className="text-gradient" style={{ fontSize: "2.8rem", marginBottom: "0.75rem", letterSpacing: "-0.03em" }}>
          Decision Canvas
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.15rem", maxWidth: "640px", margin: "0 auto" }}>
          Describe what you are contemplating. The engine will unpack your hidden assumptions, evidence gaps, stakeholders, and blind spots.
        </p>
      </div>

      {/* Quick Preset Scenarios */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
          <Sparkles size={16} color="var(--primary)" />
          <span>Try a real-world decision scenario with 1 click:</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              style={{
                textAlign: "left",
                padding: "1rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.background = "var(--surface-hover)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--surface)";
              }}
            >
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--primary)", fontWeight: 600, marginBottom: "0.25rem" }}>
                {preset.tag}
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.25rem" }}>
                {preset.title}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {preset.decision}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(255, 78, 78, 0.12)",
            color: "var(--danger)",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--danger)",
            marginBottom: "2rem"
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        
        {/* Core Decision */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="decision" style={{ fontWeight: 600, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            What decision are you considering?
            <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            State the core fork in the road clearly. Avoid pre-deciding.
          </span>
          <textarea
            id="decision"
            name="decision"
            value={formData.decision}
            onChange={handleChange}
            placeholder="e.g. Should I accept the 6-month internship offer or stay in regular college classes?"
            rows={3}
            style={{ width: "100%", resize: "vertical", fontSize: "1rem" }}
            required
          />
        </div>

        {/* Context */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="context" style={{ fontWeight: 600, fontSize: "1.05rem" }}>
            Context & Background
          </label>
          <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            What events, feelings, or current situation led to this moment?
          </span>
          <textarea
            id="context"
            name="context"
            value={formData.context}
            onChange={handleChange}
            placeholder="e.g. I'm in my 3rd year. The company is close to home with good stipend, but coursework is demanding..."
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="options" style={{ fontWeight: 600, fontSize: "1.05rem" }}>
            Options currently being considered
          </label>
          <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            List the distinct paths on your radar (Option A, Option B, etc.).
          </span>
          <textarea
            id="options"
            name="options"
            value={formData.options}
            onChange={handleChange}
            placeholder="Option 1: Take the full-time role...&#10;Option 2: Stay on campus...&#10;Option 3: Negotiate hybrid..."
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        {/* Goals & Constraints */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="goals" style={{ fontWeight: 600, fontSize: "1.05rem" }}>
              What matters most to you? (Goals)
            </label>
            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              e.g. Learning curve, financial cushion, long-term options
            </span>
            <textarea
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="e.g. Industry mentorship, financial independence, timely graduation"
              rows={3}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label htmlFor="constraints" style={{ fontWeight: 600, fontSize: "1.05rem" }}>
              Constraints & Guardrails
            </label>
            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              e.g. Non-negotiables, family boundaries, financial minimums
            </span>
            <textarea
              id="constraints"
              name="constraints"
              value={formData.constraints}
              onChange={handleChange}
              placeholder="e.g. Cannot relocate, must finish degree before 2027"
              rows={3}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>
        </div>

        {/* Deadline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="deadline" style={{ fontWeight: 600, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Clock size={16} color="var(--primary)" />
            Optional Deadline
          </label>
          <input
            id="deadline"
            type="text"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            placeholder="e.g. End of this week / Nov 15th"
            style={{ maxWidth: "340px" }}
          />
        </div>

        {/* Submit Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)"
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <CheckCircle2 size={16} color="var(--primary)" />
            <span>AI acts as an impartial thinking companion, never deciding for you.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.decision.trim()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: formData.decision.trim() ? "var(--primary)" : "var(--surface-hover)",
              color: formData.decision.trim() ? "#ffffff" : "var(--muted)",
              border: "none",
              padding: "0.9rem 2rem",
              fontSize: "1.05rem",
              fontWeight: 600,
              borderRadius: "var(--radius-md)",
              cursor: formData.decision.trim() && !isSubmitting ? "pointer" : "not-allowed",
              boxShadow: formData.decision.trim() ? "var(--shadow-glow)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            {isSubmitting ? "Examining Blind Spots..." : "Unpack Decision"}
            {isSubmitting ? <span className="spinner" /> : <Play size={18} fill="currentColor" />}
          </button>
        </div>
      </form>
    </div>
  );
}
