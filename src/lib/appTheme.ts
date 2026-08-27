// Compatibility layer for older callers — delegates to the single theme
// controller in `src/lib/theme.ts` (light / dark / system).

import { applyTheme, getStoredTheme, setTheme, type ThemeMode as Mode } from "@/lib/theme";

export type ThemeMode = "light" | "dark";

export function getThemeMode(): ThemeMode {
  const m = getStoredTheme();
  if (m === "system") {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return m;
}

export function setThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  setTheme(mode);
}

export function toggleThemeMode(): ThemeMode {
  const next: ThemeMode = getThemeMode() === "dark" ? "light" : "dark";
  setThemeMode(next);
  return next;
}

// Appearance preference: "system" | "light" | "dark".
export type Appearance = "system" | ThemeMode;

export function getAppearance(): Appearance {
  return getStoredTheme();
}

export function setAppearance(mode: Appearance) {
  setTheme(mode as Mode);
  applyTheme(mode as Mode);
}
