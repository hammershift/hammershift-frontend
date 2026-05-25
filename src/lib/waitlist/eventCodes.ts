// Event-code helpers. `EVENT_CODES_JSON` is a JSON map of {code: source}
// (e.g. {"velocity26": "sonoma_invitational"}). Codes are matched
// case-insensitive; the corresponding `source` is what we stamp on the
// WaitlistEntry's utm.source for attribution.
//
// Parsing is wrapped so a malformed env value falls back to an empty map
// rather than 500'ing every gate hit.

export interface EventCodeMap {
  [code: string]: string; // code is always lowercase
}

let cached: EventCodeMap | null = null;

export function loadEventCodes(): EventCodeMap {
  if (cached) return cached;
  const raw = process.env.EVENT_CODES_JSON;
  if (!raw) {
    cached = {};
    return cached;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: EventCodeMap = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === "string" && val.length > 0) {
        out[key.toLowerCase()] = val;
      }
    }
    cached = out;
    return cached;
  } catch (err) {
    console.error("Failed to parse EVENT_CODES_JSON:", err);
    cached = {};
    return cached;
  }
}

export function resolveEventCode(code: string): string | null {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return null;
  const map = loadEventCodes();
  return map[normalized] ?? null;
}

// Test-only: reset the cache so tests can re-read env vars between cases.
export function __resetEventCodeCache(): void {
  cached = null;
}

export const EVENT_PASS_COOKIE = "vm_event_pass";
export const EVENT_PASS_MAX_AGE_SEC = 24 * 60 * 60; // 24h
