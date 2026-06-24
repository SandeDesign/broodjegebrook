"use client";
import * as React from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "eufraat-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to dark until we have read localStorage
  const [theme, setThemeState] = React.useState<Theme>("dark");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initial: Theme = saved === "light" || saved === "dark" ? saved : "dark";
      setThemeState(initial);
      applyTheme(initial);
    } catch { /* noop */ }
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try { window.localStorage.setItem(STORAGE_KEY, t); } catch { /* noop */ }
  }, []);

  const toggle = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Suppress hydration mismatch by gating on mounted? React 19 + Next 15:
  // we render normally — initial server HTML uses dark (default), client sets actual.
  // To avoid FOUC, we add a small inline script in <head> via layout.

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(t);
  root.setAttribute("data-theme", t);
  // Update meta theme-color so the iOS PWA status bar matches
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "dark" ? "#07091c" : "#faf7f0");
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // Fallback so components outside provider don't crash during SSR
    return { theme: "dark" as Theme, setTheme: () => {}, toggle: () => {} };
  }
  return ctx;
}

/** Inline script string to set the theme before first paint (avoids FOUC). */
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.classList.add(t);
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`.trim();
