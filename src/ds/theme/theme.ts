export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "cartiva-theme";

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * A stored choice wins; otherwise the OS preference decides (both themes are equal).
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=(s==='light'||s==='dark')?s:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
