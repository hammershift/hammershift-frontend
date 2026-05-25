// Event-code helpers.
//
// Two env-var formats are supported, both case-insensitive on the code key:
//
//   1. `EVENT_CODES` — simple delimited, Amplify-friendly (no quotes).
//        Format:  code:source[,code:source]*
//        Example: EVENT_CODES=velocity26:sonoma_invitational
//        Use this for production — Amplify's amplify.yml writes env vars to
//        .env.production via `echo "VAR=$VAR" >> ...`, which mangles values
//        containing double quotes.
//
//   2. `EVENT_CODES_JSON` — JSON map, useful for local dev.
//        Format:  {"code":"source",...}
//        Example: {"velocity26":"sonoma_invitational"}
//
// If both are set, EVENT_CODES wins and EVENT_CODES_JSON is layered as a
// fallback (entries in EVENT_CODES override JSON entries of the same key).
//
// A malformed value never throws — it falls back to an empty map and logs.

export interface EventCodeMap {
  [code: string]: string; // code is always lowercase
}

let cached: EventCodeMap | null = null;

function parseDelimited(raw: string): EventCodeMap {
  const out: EventCodeMap = {};
  for (const pair of raw.split(",")) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx <= 0) continue; // require both halves
    const key = trimmed.slice(0, idx).trim().toLowerCase();
    const val = trimmed.slice(idx + 1).trim();
    if (key && val) out[key] = val;
  }
  return out;
}

function parseJson(raw: string): EventCodeMap {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: EventCodeMap = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === "string" && val.length > 0) {
        out[key.toLowerCase()] = val;
      }
    }
    return out;
  } catch (err) {
    console.error("Failed to parse EVENT_CODES_JSON:", err);
    return {};
  }
}

export function loadEventCodes(): EventCodeMap {
  if (cached) return cached;
  const json = process.env.EVENT_CODES_JSON;
  const delimited = process.env.EVENT_CODES;
  const fromJson = json ? parseJson(json) : {};
  const fromDelimited = delimited ? parseDelimited(delimited) : {};
  // Delimited entries override JSON entries of the same key.
  cached = { ...fromJson, ...fromDelimited };
  return cached;
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
