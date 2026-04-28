// src/lib/auctionFields.ts
//
// Read-only narrowing helpers for the loose auction document shape produced
// by the scraper. The `attributes` array's key casing varies across scraper
// versions, so always go through getAttribute() — never index by position.

export interface AuctionAttribute {
  key?: unknown;
  value?: unknown;
}

export interface AuctionLike {
  title?: unknown;
  image?: unknown;
  images_list?: unknown;
  attributes?: unknown;
  description?: unknown;
  listing_details?: unknown;
  page_url?: unknown;
  sort?: unknown;
}

function isAttr(v: unknown): v is AuctionAttribute {
  return typeof v === "object" && v !== null;
}

/**
 * Case-insensitive attribute lookup. Returns the first matching string value
 * or null if missing / non-string. Never throws on malformed shapes.
 */
export function getAttribute(auction: AuctionLike, key: string): string | null {
  const arr = auction.attributes;
  if (!Array.isArray(arr)) return null;
  const lower = key.toLowerCase();
  for (const raw of arr) {
    if (!isAttr(raw)) continue;
    const k = typeof raw.key === "string" ? raw.key.toLowerCase() : "";
    if (k === lower) {
      return typeof raw.value === "string" ? raw.value : null;
    }
  }
  return null;
}

export function getMileage(auction: AuctionLike): string | null {
  return getAttribute(auction, "mileage") ?? getAttribute(auction, "miles");
}

export function getLocation(auction: AuctionLike): string | null {
  return getAttribute(auction, "location");
}

export function getSeller(auction: AuctionLike): string | null {
  return getAttribute(auction, "seller");
}

export function getLot(auction: AuctionLike): string | null {
  return getAttribute(auction, "lot") ?? getAttribute(auction, "lot_number");
}

export interface GalleryImage {
  src: string;
}

/**
 * Returns gallery images (deduped, ordered). Falls back to [auction.image]
 * when images_list is missing or empty. Returns [] if neither is usable.
 */
export function getGallery(auction: AuctionLike): GalleryImage[] {
  const list = auction.images_list;
  const out: GalleryImage[] = [];
  if (Array.isArray(list)) {
    for (const item of list) {
      if (typeof item === "object" && item !== null) {
        const src = (item as { src?: unknown }).src;
        if (typeof src === "string" && src.length > 0) {
          out.push({ src });
        }
      }
    }
  }
  if (out.length === 0 && typeof auction.image === "string" && auction.image.length > 0) {
    out.push({ src: auction.image });
  }
  // dedupe by src
  const seen = new Set<string>();
  return out.filter((g) => (seen.has(g.src) ? false : (seen.add(g.src), true)));
}

/**
 * Description blocks. The scraper writes either:
 *   - string[] (paragraphs), or
 *   - Array<string | string[]> with nested arrays for bullet groups.
 * Returns a normalized form: { kind: "p", text } | { kind: "ul", items }.
 */
export type DescriptionBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export function getDescriptionBlocks(auction: AuctionLike): DescriptionBlock[] {
  const desc = auction.description;
  if (!Array.isArray(desc)) return [];
  const out: DescriptionBlock[] = [];
  for (const block of desc) {
    if (typeof block === "string" && block.trim().length > 0) {
      out.push({ kind: "p", text: block });
    } else if (Array.isArray(block)) {
      const items = block.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0
      );
      if (items.length > 0) out.push({ kind: "ul", items });
    }
  }
  return out;
}

/**
 * Best-effort highlights — the scraper sometimes puts these in
 * listing_details, sometimes in attributes with key "highlights".
 * Returns string[] (empty if neither has usable content).
 */
export function getHighlights(auction: AuctionLike): string[] {
  const ld = auction.listing_details;
  if (Array.isArray(ld)) {
    return ld.filter(
      (s): s is string => typeof s === "string" && s.trim().length > 0
    );
  }
  const attr = getAttribute(auction, "highlights");
  if (attr) {
    return attr
      .split(/\r?\n|•|·/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
}

export function getBaTUrl(auction: AuctionLike): string | null {
  return typeof auction.page_url === "string" && auction.page_url.length > 0
    ? auction.page_url
    : null;
}

export interface AuctionStatusLite {
  currentBidUsd: number | null;
  deadline: Date | null;
}

export function getAuctionStatus(auction: AuctionLike): AuctionStatusLite {
  const sort = auction.sort;
  if (typeof sort !== "object" || sort === null) {
    return { currentBidUsd: null, deadline: null };
  }
  const s = sort as { price?: unknown; deadline?: unknown };
  const price = typeof s.price === "number" && Number.isFinite(s.price) ? s.price : null;
  let deadline: Date | null = null;
  if (s.deadline instanceof Date) deadline = s.deadline;
  else if (typeof s.deadline === "string") {
    const d = new Date(s.deadline);
    if (!isNaN(d.getTime())) deadline = d;
  }
  return { currentBidUsd: price, deadline };
}
