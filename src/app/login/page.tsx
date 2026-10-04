"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, User, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (user: { name: string; email: string; provider: string }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blind_spot_user_profile", JSON.stringify(user));
    }
    router.push("/");
  };

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

    setTimeout(() => {
      setLoading(false);
      handleSuccess({
        name: mode === "signup" ? name : email.split("@")[0],
        email,
        provider: "email"
      });
    }, 600);
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      handleSuccess({
        name: provider === "google" ? "Demo User (Google)" : "Demo Developer (GitHub)",
        email: provider === "google" ? "demo.user@gmail.com" : "developer@github.com",
        provider
      });
    }, 500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)", color: "var(--foreground)" }}>
      {/* Top Header */}
      <div style={{ padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)", textDecoration: "none", fontSize: "0.95rem" }}
        >
          <ArrowLeft size={16} /> Back to Blind Spot
        </Link>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)", boxShadow: "var(--shadow-glow)" }} />
          BLIND SPOT
        </div>
      </div>

      {/* Main Form Center */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            padding: "2.5rem"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "-0.03em" }}>
              {mode === "signin" ? "Sign in to Blind Spot" : "Create your account"}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
              {mode === "signin" ? "Access your saved decisions, radar models, and reflections" : "Empower your reasoning with an AI thinking companion"}
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
                padding: "0.55rem",
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
              Sign In (Existing User)
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              style={{
                padding: "0.55rem",
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

          {/* Social OAuth */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
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
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase" }}>or email</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ padding: "0.75rem", background: "rgba(255, 78, 78, 0.12)", border: "1px solid var(--danger)", borderRadius: "var(--radius-md)", color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Your Name</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Maya Chen"
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
                  placeholder="name@example.com"
                  style={{ width: "100%", paddingLeft: "2.4rem" }}
                  required
                />
                <Mail size={16} color="var(--muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Password</label>
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

          {/* Switch */}
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

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "1.25rem", fontSize: "0.75rem", color: "var(--muted)" }}>
            <Shield size={13} color="var(--primary)" />
            <span>Encrypted & private decision workspace.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
