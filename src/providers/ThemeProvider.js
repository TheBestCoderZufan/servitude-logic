// src/providers/ThemeProvider.js
"use client";

/**
 * @module providers/ThemeProvider
 */
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { theme as lightTheme, darkTheme } from "@/styles/theme";

const VALID_PREFERENCES = new Set(["light", "dark", "system"]);
const DARK_BG = "#0f172a";
const LIGHT_BG = "#ffffff";
const DARK_FG = "#f8fafc";
const LIGHT_FG = "#1e293b";

/**
 * ThemeBridge
 * Bridges the `next-themes` state with styled-components while enforcing
 * route-level constraints (only admin/dashboard routes may use dark mode).
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Descendant nodes.
 * @param {boolean} props.scoped - Whether the current route is eligible for dark mode.
 * @returns {JSX.Element}
 */
function ThemeBridge({ children, scoped }) {
  const { resolvedTheme, setTheme, theme: preference = "system" } = useTheme();
  const effectiveMode = scoped ? (resolvedTheme === "dark" ? "dark" : "light") : "light";

  const styledTheme = useMemo(() => (effectiveMode === "dark" ? darkTheme : lightTheme), [effectiveMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.__themeMode = effectiveMode;
    window.__themePreference = preference;
    window.__setThemePreference = (next) => {
      if (!VALID_PREFERENCES.has(next)) {
        return;
      }
      try {
        window.localStorage.setItem("themePreference", next);
        document.cookie = `themePreference=${encodeURIComponent(next)}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (_) {}
      setTheme(next);
    };
    try {
      window.dispatchEvent(new CustomEvent("theme-mode", { detail: effectiveMode }));
    } catch (_) {}
    return () => {
      try {
        delete window.__setThemePreference;
      } catch (_) {}
    };
  }, [effectiveMode, preference, setTheme]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const bg = effectiveMode === "dark" ? DARK_BG : LIGHT_BG;
    const fg = effectiveMode === "dark" ? DARK_FG : LIGHT_FG;
    document.documentElement.style.backgroundColor = bg;
    const body = document.body;
    if (body) {
      body.style.backgroundColor = bg;
      body.style.color = fg;
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", bg);
    }
  }, [effectiveMode]);

  return <StyledThemeProvider theme={styledTheme}>{children}</StyledThemeProvider>;
}

/**
 * ThemeProvider
 * Applies Tailwind-compatible theming, using `next-themes` for persistence while
 * deferring styled-components values to the enforced route-level mode policy.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Descendant content.
 * @returns {JSX.Element}
 */
export default function ThemeProvider({ children }) {
  const pathname = usePathname();
  const scoped = pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  return (
    <NextThemesProvider
      attribute="data-mode"
      defaultTheme="system"
      enableSystem
      forcedTheme={scoped ? undefined : "light"}
      storageKey="servitude-logic-theme"
      disableTransitionOnChange
      value={{ light: "light", dark: "dark" }}
    >
      <ThemeBridge scoped={Boolean(scoped)}>{children}</ThemeBridge>
    </NextThemesProvider>
  );
}
