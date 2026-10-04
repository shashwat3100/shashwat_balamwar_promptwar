"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Brain, EyeOff, Target, CheckCircle2, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import HistoryModal from "@/components/HistoryModal";
import AuthModal from "@/components/AuthModal";
import DecisionCanvas from "@/components/DecisionCanvas";
import DecisionWorkspace from "@/components/DecisionWorkspace";
import { StructuredDecisionModel } from "@/types/decision";
import { saveDecisionToHistory, getActiveSession } from "@/lib/storage";

interface UserProfile {
  name: string;
  email: string;
  provider: string;
}

export default function Home() {
  const [stage, setStage] = useState<"landing" | "canvas" | "workspace">("landing");
  const [model, setModel] = useState<StructuredDecisionModel | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Restore active session and user profile on mount
  useEffect(() => {
    const saved = getActiveSession();
    if (saved) {
      setModel(saved);
    }

    try {
      const savedUser = localStorage.getItem("blind_spot_user_profile");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load user profile:", e);
    }
  }, []);

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("blind_spot_user_profile", JSON.stringify(newUser));
    }
  };

  const handleSignOut = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("blind_spot_user_profile");
    }
  };

  const handleStart = () => {
    setStage(model ? "workspace" : "canvas");
  };

  const handleAnalysisComplete = (newModel: StructuredDecisionModel) => {
    setModel(newModel);
    saveDecisionToHistory(newModel);
    setStage("workspace");
  };

  const handleResetToCanvas = () => {
    setStage("canvas");
  };

  const handleNewDecision = () => {
    setStage("canvas");
  };

  const handleGoWorkspace = () => {
    if (model) {
      setStage("workspace");
    } else {
      setStage("canvas");
    }
  };

  const handleResumeDecision = (resumedModel: StructuredDecisionModel) => {
    setModel(resumedModel);
    saveDecisionToHistory(resumedModel);
    setStage("workspace");
  };

  return (
    <>
      <Navbar
        onGoHome={() => setStage("landing")}
        onGoWorkspace={handleGoWorkspace}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewDecision={handleNewDecision}
        onOpenAuth={() => setIsAuthOpen(true)}
        hasActiveDecision={!!model}
        user={user}
        onSignOut={handleSignOut}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onResumeDecision={handleResumeDecision}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <div style={{ paddingTop: "2.5rem" }}>
        {stage === "workspace" && model && (
          <DecisionWorkspace
            initialModel={model}
            onReset={handleResetToCanvas}
          />
        )}

        {stage === "canvas" && (
          <DecisionCanvas
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {stage === "landing" && (
          <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: "2rem", paddingBottom: "4rem" }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 1rem",
                background: "rgba(78, 131, 255, 0.1)",
                border: "1px solid rgba(78, 131, 255, 0.25)",
                color: "var(--primary)",
                borderRadius: "var(--radius-xl)",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "2rem"
              }}
            >
              <Brain size={16} />
              <span>PromptWars 2026 Submission</span>
            </div>

            {/* Main Hero Title */}
            <h1 className="text-gradient" style={{ fontSize: "4.2rem", maxWidth: "860px", marginBottom: "1.5rem", lineHeight: 1.08, letterSpacing: "-0.035em" }}>
              See what your thinking might be missing.
            </h1>

            <p style={{ color: "var(--muted)", fontSize: "1.25rem", maxWidth: "660px", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              We often make decisions based on what we notice first. <strong>Blind Spot</strong> is an AI-powered thinking companion that uncovers hidden assumptions, missing evidence, alternatives, and risks — <em>without deciding for you</em>.
            </p>

            {/* Primary CTA */}
            <button
              onClick={handleStart}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                background: "var(--primary)",
                color: "#ffffff",
                border: "none",
                padding: "1rem 2.25rem",
                fontSize: "1.15rem",
                fontWeight: 600,
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-glow)",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <span>{model ? "Resume Active Workspace" : "Open Decision Workspace"}</span>
              <ArrowRight size={20} />
            </button>

            {/* Core Principle Callout */}
            <div
              style={{
                marginTop: "3rem",
                padding: "1rem 1.5rem",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.95rem",
                color: "var(--foreground)",
                maxWidth: "600px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                textAlign: "left"
              }}
            >
              <ShieldAlert size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>
                <strong>The Human Remains in Control:</strong> The system will never say <em>"You should choose A."</em> Instead, it helps you see the unseen so you make the best decision.
              </span>
            </div>

            {/* Feature Value Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.5rem",
                marginTop: "4.5rem",
                width: "100%",
                maxWidth: "1050px"
              }}
            >
              <FeatureCard
                icon={<EyeOff size={24} color="var(--danger)" />}
                title="Blind Spot Radar"
                description="Visualizes 6 key dimensions: Evidence, Assumptions, Alternatives, Stakeholders, Risks, and Consequences with live state feedback."
              />
              <FeatureCard
                icon={<Target size={24} color="var(--warning)" />}
                title="Assumption Stress-Testing"
                description="Pins down unstated beliefs and tests load-bearing assumptions before they turn into costly regrets."
              />
              <FeatureCard
                icon={<Brain size={24} color="var(--primary)" />}
                title="Adaptive Questioning"
                description="Asks targeted, load-bearing questions one at a time and dynamically updates its reasoning model based on your answers."
              />
              <FeatureCard
                icon={<CheckCircle2 size={24} color="var(--success)" />}
                title="Decision Brief Synthesis"
                description="Generates an executive summary with pre-mortem failure modes and reversibility analysis, concluding with 'YOU DECIDE'."
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      style={{
        textAlign: "left",
        padding: "1.75rem",
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem", color: "#ffffff" }}>{title}</h3>
      <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>{description}</p>
    </div>
  );
}
