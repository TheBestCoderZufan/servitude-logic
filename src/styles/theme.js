// src/styles/theme.js

// theme is for the light theme
export const theme = {
  colors: {
    // Primary colors
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    primaryLight: "#3b82f6",

    // Secondary colors
    secondary: "#64748b",
    secondaryHover: "#475569",

    // Background colors
    background: "#ffffff",
    backgroundSecondary: "#f8fafc",
    surface: "#ffffff",
    surfaceHover: "#f1f5f9",

    // Text colors
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
      muted: "#94a3b8",
      white: "#ffffff",
    },

    // Status colors
    success: "#10b981",
    successLight: "#d1fae5",
    warning: "#f59e0b",
    warningLight: "#fef3c7",
    error: "#ef4444",
    errorLight: "#fee2e2",
    info: "#3b82f6",
    infoLight: "#dbeafe",

    // Border colors
    border: "#e2e8f0",
    borderLight: "#f1f5f9",
    borderDark: "#cbd5e1",

    // Accent palette
    accent: {
      electric: "#6366f1",
      iris: "#a855f7",
      lagoon: "#0ea5e9",
      sunrise: "#f97316",
      emerald: "#10b981",
      slate: "#475569",
      aurora: "#667eea",
      amethyst: "#764ba2",
      aqua: "#06b6d4",
      coral: "#ff6b6b",
      ember: "#ee5a24",
      quartz: "#f1f5ff",
    },

    // Project status colors
    status: {
      planning: "#8b5cf6",
      inProgress: "#3b82f6",
      completed: "#10b981",
      onHold: "#f59e0b",
      cancelled: "#ef4444",
    },

    // Task priority colors
    priority: {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#ef4444",
    },
  },

  // Typography
  fonts: {
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
  },

  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },

  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Spacing
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
  },

  // Border radius
  radii: {
    none: "0",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },

  // Elevation (for styled-components)
  elevation: {
    none: "none",
    small: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    medium:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    large:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },

  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Z-index values
  zIndices: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Transitions
  transitions: {
    fast: "0.15s ease-in-out",
    base: "0.2s ease-in-out",
    slow: "0.3s ease-in-out",
  },
};

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    // Primary colors
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    primaryLight: "#60a5fa",

    // Secondary colors
    secondary: "#94a3b8",
    secondaryHover: "#64748b",

    // Background colors
    background: "#0f172a",
    backgroundSecondary: "#1e293b",
    surface: "#1e293b",
    surfaceHover: "#334155",

    // Text colors
    text: {
      ...theme.colors.text,
      primary: "#f8fafc",
      secondary: "#cbd5e1",
      muted: "#94a3b8",
      white: "#ffffff",
    },

    // Status and info colors
    success: "#10b981",
    successLight: "#064e3b",
    warning: "#f59e0b",
    warningLight: "#78350f",
    error: "#ef4444",
    errorLight: "#7f1d1d",
    info: "#3b82f6",
    infoLight: "#1e3a8a",

    // Borders
    border: "#334155",
    borderLight: "#475569",
    borderDark: "#1e293b",

    accent: {
      ...theme.colors.accent,
      electric: "#818cf8",
      iris: "#c084fc",
      lagoon: "#38bdf8",
      sunrise: "#fb923c",
      emerald: "#34d399",
      slate: "#94a3b8",
    },

    // Keep existing status/priority keys (override if desired)
    status: {
      ...theme.colors.status,
    },
    priority: {
      ...theme.colors.priority,
    },
  },
};
