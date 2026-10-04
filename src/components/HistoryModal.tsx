"use client";

import { useEffect, useState } from "react";
import { X, Clock, Trash2, ArrowRight, BookOpen, AlertTriangle } from "lucide-react";
import { StoredDecisionSession, getStoredHistory, deleteDecisionFromHistory, clearAllHistory } from "@/lib/storage";
import { StructuredDecisionModel } from "@/types/decision";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeDecision: (model: StructuredDecisionModel) => void;
}

export default function HistoryModal({ isOpen, onClose, onResumeDecision }: HistoryModalProps) {
  const [history, setHistory] = useState<StoredDecisionSession[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getStoredHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteDecisionFromHistory(id);
    setHistory(updated);
  };

  const handleClearAll = () => {
    if (confirm("Clear all saved decision history?")) {
      clearAllHistory();
      setHistory([]);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1.5rem"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
          animation: "scaleIn 0.2s ease"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={18} color="var(--primary)" />
            <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 600 }}>Decision History</h2>
            <span
              style={{
                fontSize: "0.8rem",
                padding: "0.15rem 0.5rem",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "10px",
                color: "var(--muted)"
              }}
            >
              {history.length}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "color 0.2s ease"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: "0.25rem"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted)" }}>
              <BookOpen size={42} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.1rem", color: "var(--foreground)", marginBottom: "0.5rem" }}>
                No Saved Decisions Yet
              </h3>
              <p style={{ fontSize: "0.9rem", maxWidth: "380px", margin: "0 auto" }}>
                Whenever you analyze a decision on the canvas, your structured model, answers, and reflections are automatically preserved here.
              </p>
            </div>
          ) : (
            history.map(session => (
              <div
                key={session.id}
                onClick={() => {
                  onResumeDecision(session.model);
                  onClose();
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.background = "var(--surface-hover)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {formatDate(session.updatedAt)}
                  </div>
                  <button
                    type="button"
                    onClick={e => handleDelete(session.id, e)}
                    title="Delete session"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--muted)",
                      cursor: "pointer",
                      padding: "0.2rem"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.5rem" }}>
                  {session.model.decision}
                </h3>

                <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 0.75rem 0", lineHeight: 1.4 }}>
                  {session.model.summary}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", color: "var(--muted)" }}>
                    <span>{session.model.assumptions.length} Assumptions</span>
                    <span>•</span>
                    <span>{session.model.questions.filter(q => q.answered).length} Questions Answered</span>
                  </div>

                  <span style={{ color: "var(--primary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    Resume <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}
