"use client";

import { useState } from "react";
import { X, Lock, Mail, User, ArrowRight, CheckCircle2, Shield } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; provider: string }) => void;
  initialMode?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mode === "signup" && !name) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate instant secure auth
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: mode === "signup" ? name : email.split("@")[0],
        email,
        provider: "email"
      };
      onLoginSuccess(user);
      onClose();
    }, 600);
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      const user = {
        name: provider === "google" ? "Demo User (Google)" : "Demo Developer (GitHub)",
        email: provider === "google" ? "demo.user@gmail.com" : "developer@github.com",
        provider
      };
      onLoginSuccess(user);
      onClose();
    }, 500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
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
          maxWidth: "460px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          padding: "2.25rem",
          position: "relative",
          animation: "authScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            padding: "0.25rem"
          }}
        >
          <X size={20} />
        </button>

        {/* Logo and Tagline */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)", boxShadow: "var(--shadow-glow)" }} />
            <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>BLIND SPOT</span>
          </div>
          <h2 style={{ fontSize: "1.65rem", fontWeight: 700, marginBottom: "0.35rem", letterSpacing: "-0.02em" }}>
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
            {mode === "signin" ? "Sign in to save and review your decision workspaces" : "Start making better, blind-spot-free decisions"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "0.25rem",
            marginBottom: "1.5rem"
          }}
        >
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); }}
            style={{
              padding: "0.5rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: mode === "signin" ? "var(--surface)" : "transparent",
              color: mode === "signin" ? "#ffffff" : "var(--muted)",
              fontWeight: mode === "signin" ? 600 : 500,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); }}
            style={{
              padding: "0.5rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: mode === "signup" ? "var(--surface)" : "transparent",
              color: mode === "signup" ? "#ffffff" : "var(--muted)",
              fontWeight: mode === "signup" ? 600 : 500,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            New User (Sign Up)
          </button>
        </div>

        {/* OAuth Social Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 500,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.background = "var(--surface-hover)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--background)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("github")}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 500,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.background = "var(--surface-hover)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--background)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Form Error */}
        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(255, 78, 78, 0.12)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius-md)",
              color: "var(--danger)",
              fontSize: "0.85rem",
              marginBottom: "1rem"
            }}
          >
            {error}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {mode === "signup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  style={{ width: "100%", paddingLeft: "2.4rem" }}
                  required
                />
                <User size={16} color="var(--muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: "100%", paddingLeft: "2.4rem" }}
                required
              />
              <Mail size={16} color="var(--muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Password</label>
              {mode === "signin" && (
                <span style={{ fontSize: "0.8rem", color: "var(--primary)", cursor: "pointer" }}>
                  Forgot password?
                </span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ width: "100%", paddingLeft: "2.4rem" }}
                required
              />
              <Lock size={16} color="var(--muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              background: "var(--primary)",
              color: "#ffffff",
              border: "none",
              padding: "0.85rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "var(--shadow-glow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease"
            }}
          >
            <span>{loading ? "Authenticating..." : mode === "signin" ? "Sign In" : "Create Account"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer switch */}
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(null); }}
                style={{ background: "transparent", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); }}
                style={{ background: "transparent", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Privacy Note */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "1.25rem", fontSize: "0.75rem", color: "var(--muted)" }}>
          <Shield size={13} color="var(--primary)" />
          <span>Your decision data remains private and confidential.</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes authScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
}
