import type { Product } from "./types";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const words = (s: string) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Client-side relevance. Every query word must match the START of a word in the
 * title, brand or category — so "sony" finds Sony, not "DosOnyx" inside a laptop
 * name. An exact brand match ranks first, then titles that begin with the query.
 * (The API's own keyword filter is unreliable, which is why search runs here.)
 */
export function searchProducts(products: Product[], query: string, limit = Infinity): Product[] {
  const q = norm(query);
  const qWords = words(query);
  if (!qWords.length) return [];

  return products
    .map((p) => {
      const titleWords = words(p.title);
      const brand = norm(p.brand?.name ?? "");
      const hay = [...titleWords, ...words(p.brand?.name ?? ""), ...words(p.category?.name ?? "")];
      if (!qWords.every((w) => hay.some((h) => h.startsWith(w)))) return null;

      let score = 0;
      if (brand && brand === q) score += 10;
      if (norm(p.title).startsWith(q)) score += 6;
      score += qWords.filter((w) => titleWords.some((t) => t === w)).length * 2;
      score += qWords.filter((w) => titleWords.some((t) => t.startsWith(w))).length;
      score += Math.min(2, (p.sold ?? 0) / 2000); // popular items edge ahead on ties
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits `text` around the first word-start match of the query's first word, for highlighting. */
export function splitMatch(text: string, query: string): [string, string, string] | null {
  const first = query.trim().split(/\s+/)[0];
  if (!first) return null;
  const m = new RegExp(`(^|[^a-z0-9])(${escape(first)})`, "i").exec(text);
  if (!m) return null;
  const start = m.index + m[1].length;
  return [text.slice(0, start), text.slice(start, start + first.length), text.slice(start + first.length)];
}
