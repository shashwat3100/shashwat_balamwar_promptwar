import { StructuredDecisionModel } from "@/types/decision";

export interface StoredDecisionSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  model: StructuredDecisionModel;
}

const STORAGE_KEY = "blind_spot_decision_history_v1";
const ACTIVE_SESSION_KEY = "blind_spot_active_session_v1";

export function getStoredHistory(): StoredDecisionSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read history from localStorage:", e);
    return [];
  }
}

export function saveDecisionToHistory(model: StructuredDecisionModel): StoredDecisionSession {
  if (typeof window === "undefined") {
    return {
      id: "session-fallback",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model
    };
  }

  try {
    const history = getStoredHistory();
    // Check if a session with this exact decision exists
    const existingIndex = history.findIndex(s => s.model.decision === model.decision);
    const now = new Date().toISOString();

    let session: StoredDecisionSession;
    if (existingIndex >= 0) {
      session = {
        ...history[existingIndex],
        updatedAt: now,
        model
      };
      history[existingIndex] = session;
    } else {
      session = {
        id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
        model
      };
      history.unshift(session);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(model));
    return session;
  } catch (e) {
    console.error("Failed to save decision to localStorage:", e);
    return {
      id: "session-error",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model
    };
  }
}

export function getActiveSession(): StructuredDecisionModel | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function deleteDecisionFromHistory(id: string): StoredDecisionSession[] {
  if (typeof window === "undefined") return [];
  try {
    const history = getStoredHistory().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return history;
  } catch (e) {
    return [];
  }
}

export function clearAllHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (e) {
    console.error("Failed to clear localStorage:", e);
  }
}
