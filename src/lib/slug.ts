/**
 * Generate a URL-safe slug from an auction title.
 * Example: "2024 Ferrari 296 GTS" → "2024-ferrari-296-gts"
 */
export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Reverse lookup: given a slug, find a matching market by comparing
 * the slug against each auction title in the markets list.
 */
export function slugMatches(title: string, slug: string): boolean {
  return toSlug(title) === slug;
}
