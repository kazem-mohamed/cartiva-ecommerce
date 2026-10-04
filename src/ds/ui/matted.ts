/**
 * Catalogue photos with a white mat baked in: a ~30px white border down the sides of a
 * grey studio backdrop (audited over all 351 API photos, 2026-10-03). On a plate the mat
 * shows as pale strips along the edges, so these are drawn 10% closer — 660 → 600px wide,
 * which puts the mat just outside the frame. Every other photo stays exactly as shot.
 */
const MATTED = new Set([
  "1680393143751-1.jpeg", "1680393143752-2.jpeg", "1680401176768-3.jpeg", "1680401528864-cover.jpeg", "1680401528923-1.jpeg",
  "1680401528924-2.jpeg", "1680401893316-cover.jpeg", "1680401893496-1.jpeg", "1680401893496-2.jpeg", "1680401893496-3.jpeg",
  "1680402295928-cover.jpeg", "1680402296305-1.jpeg", "1680402296306-3.jpeg", "1680402411833-cover.jpeg", "1680402411883-1.jpeg",
  "1680402411883-2.jpeg", "1680402411883-3.jpeg", "1680402563675-1.jpeg", "1680402563676-2.jpeg", "1680402563676-3.jpeg",
  "1680402563677-5.jpeg", "1680402838331-2.jpeg", "1680402838331-3.jpeg", "1680402838332-4.jpeg", "1680403156555-3.jpeg",
  "1680403156556-4.jpeg", "1680403266805-1.jpeg", "1680403266806-3.jpeg", "1680403266807-4.jpeg", "1680403397482-2.jpeg",
  "1680403397485-4.jpeg",
]);

/** For a photo that fills an 11:15 frame: crops the mat away, or nothing for a clean photo. */
export function matCrop(src?: string) {
  return src && MATTED.has(src.slice(src.lastIndexOf("/") + 1)) ? "scale-[1.1]" : undefined;
}
