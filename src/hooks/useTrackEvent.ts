// Session-aware event tracker.
//
// Adds a client-generated `sessionId` to every tracked event so analytics
// can group events into sessions (30-min idle rotation, matches the
// industry default). Sessions live in sessionStorage so a fresh tab gets
// a new id, but reloads within the tab keep the same one.
//
// `sessionId` is sent as part of event_data; server stores it under
// UserEvent.event_data.sessionId. Backend admin/metrics aggregation reads
// it back out to compute the "Prediction Submit Rate" adoption metric
// (sessions with ≥1 prediction_made / total sessions).

const SESSION_KEY = "vm_session";
const SESSION_LAST_ACTIVITY_KEY = "vm_session_last_activity";
const SESSION_IDLE_MS = 30 * 60 * 1000; // 30 minutes

function uuid(): string {
  // crypto.randomUUID is available in all modern browsers and Node 19+
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older runtimes — sufficient for analytics grouping.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrRotateSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const now = Date.now();
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    const lastActivityRaw = window.sessionStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
    const lastActivity = lastActivityRaw ? parseInt(lastActivityRaw, 10) : 0;
    if (stored && lastActivity && now - lastActivity < SESSION_IDLE_MS) {
      window.sessionStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now));
      return stored;
    }
    const fresh = uuid();
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    window.sessionStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now));
    return fresh;
  } catch {
    // sessionStorage blocked (private mode / disabled) — events still fire,
    // just without session grouping. Adoption metric falls back to per-user
    // event counts.
    return null;
  }
}

export const useTrackEvent = () => {
  const track = async (event_type: string, event_data?: object) => {
    try {
      const sessionId = getOrRotateSessionId();
      const payload = {
        event_type,
        event_data: {
          ...(event_data ?? {}),
          ...(sessionId ? { sessionId } : {}),
        },
      };
      await fetch("/api/events/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Event tracking failed:", error);
    }
  };
  return track;
};
