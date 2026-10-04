"use client";

import { useState, useEffect } from "react";
import { Clock, PlusCircle, LayoutDashboard, LogIn, LogOut, UserCheck } from "lucide-react";
import { getStoredHistory } from "@/lib/storage";

interface UserProfile {
  name: string;
  email: string;
  provider: string;
}

interface NavbarProps {
  onGoHome: () => void;
  onGoWorkspace: () => void;
  onOpenHistory: () => void;
  onNewDecision: () => void;
  onOpenAuth: () => void;
  hasActiveDecision: boolean;
  user: UserProfile | null;
  onSignOut: () => void;
}

export default function Navbar({
  onGoHome,
  onGoWorkspace,
  onOpenHistory,
  onNewDecision,
  onOpenAuth,
  hasActiveDecision,
  user,
  onSignOut
}: NavbarProps) {
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setHistoryCount(getStoredHistory().length);
    };
    updateCount();

    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, []);

  return (
    <header style={{ borderBottom: "1px solid var(--border)", padding: "0.85rem 0", background: "rgba(10, 10, 12, 0.8)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Brand / Logo */}
        <button
          onClick={onGoHome}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "1.25rem",
            letterSpacing: "-0.03em",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            color: "var(--foreground)",
            padding: 0
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--primary)", boxShadow: "var(--shadow-glow)" }} />
          <span>BLIND SPOT</span>
        </button>

        {/* Navigation Items */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          
          {/* Workspace Button */}
          <button
            onClick={onGoWorkspace}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "transparent",
              border: "none",
              color: "var(--foreground)",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LayoutDashboard size={16} color="var(--primary)" />
            <span>Workspace</span>
            {hasActiveDecision && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
            )}
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "transparent",
              border: "none",
              color: "var(--foreground)",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Clock size={16} color="var(--muted)" />
            <span>History</span>
            {historyCount > 0 && (
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(78, 131, 255, 0.2)",
                  color: "var(--primary)",
                  padding: "0.1rem 0.45rem",
                  borderRadius: "10px",
                  fontWeight: 600
                }}
              >
                {historyCount}
              </span>
            )}
          </button>

          {/* New Decision Action */}
          <button
            onClick={onNewDecision}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              padding: "0.45rem 0.85rem",
              borderRadius: "var(--radius-md)",
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
            <PlusCircle size={15} color="var(--primary)" />
            <span>New Decision</span>
          </button>

          {/* Auth Button or User Profile */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem", paddingLeft: "0.75rem", borderLeft: "1px solid var(--border)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  background: "rgba(78, 131, 255, 0.1)",
                  border: "1px solid rgba(78, 131, 255, 0.25)",
                  borderRadius: "var(--radius-xl)",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.85rem",
                  color: "#ffffff"
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ maxWidth: "110px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </span>
              </div>

              <button
                onClick={onSignOut}
                title="Sign out"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  padding: "0.35rem",
                  display: "flex",
                  alignItems: "center"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "rgba(78, 131, 255, 0.15)",
                border: "1px solid var(--primary)",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-md)",
                transition: "all 0.2s ease",
                marginLeft: "0.5rem"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--primary)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(78, 131, 255, 0.15)";
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

        </nav>

      </div>
    </header>
  );
}
