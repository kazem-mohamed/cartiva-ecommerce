/** Where to go after signing in: ?callbackUrl=, but only a path on this site ("/checkout" yes; "//x.com" or "https://…" no). */
export function callbackTarget(fallback = "/") {
  if (typeof window === "undefined") return fallback;
  const raw = new URLSearchParams(window.location.search).get("callbackUrl");
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}
