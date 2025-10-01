const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "[data-mode='dark']"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--sl-color-background)",
        foreground: "var(--sl-color-foreground)",
        surface: "var(--sl-color-surface)",
        muted: "var(--sl-color-text-muted)",
        primary: {
          DEFAULT: "var(--sl-color-primary)",
          foreground: "var(--sl-color-on-primary)",
          hover: "var(--sl-color-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--sl-color-secondary)",
          foreground: "var(--sl-color-on-secondary)",
        },
        accent: {
          DEFAULT: "var(--sl-color-accent)",
          soft: "var(--sl-color-accent-soft)",
        },
        border: "var(--sl-color-border)",
        ring: "var(--sl-color-ring)",
      },
      borderRadius: {
        sm: "var(--sl-radius-sm)",
        DEFAULT: "var(--sl-radius-md)",
        lg: "var(--sl-radius-lg)",
        xl: "var(--sl-radius-xl)",
        full: "var(--sl-radius-full)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        heading: ["var(--font-heading)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        lifted: "0 20px 45px -18px rgba(15, 23, 42, 0.45)",
      },
      backgroundImage: {
        "glow-iris": "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.35), transparent 60%)",
        "glow-lagoon": "radial-gradient(circle at 80% 30%, rgba(14, 165, 233, 0.3), transparent 65%)",
      },
    },
  },
  plugins: [],
};
