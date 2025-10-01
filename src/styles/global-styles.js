// src/styles/global-styles.js
"use client";
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  :root {
    --sl-color-background: ${({ theme }) => theme.colors.background};
    --sl-color-foreground: ${({ theme }) => theme.colors.text.primary};
    --sl-color-surface: ${({ theme }) => theme.colors.surface};
    --sl-color-text-muted: ${({ theme }) => theme.colors.text.muted};
    --sl-color-primary: ${({ theme }) => theme.colors.primary};
    --sl-color-primary-hover: ${({ theme }) => theme.colors.primaryHover};
    --sl-color-on-primary: ${({ theme }) => theme.colors.text.white};
    --sl-color-secondary: ${({ theme }) => theme.colors.secondary};
    --sl-color-on-secondary: ${({ theme }) => theme.colors.text.white};
    --sl-color-accent: ${({ theme }) => theme.colors.accent.lagoon};
    --sl-color-accent-soft: ${({ theme }) => theme.colors.accent.quartz};
    --sl-color-border: ${({ theme }) => theme.colors.border};
    --sl-color-ring: ${({ theme }) => theme.colors.primaryLight};
    --sl-radius-sm: ${({ theme }) => theme.radii.sm};
    --sl-radius-md: ${({ theme }) => theme.radii.md};
    --sl-radius-lg: ${({ theme }) => theme.radii.lg};
    --sl-radius-xl: ${({ theme }) => theme.radii["2xl"]};
    --sl-radius-full: ${({ theme }) => theme.radii.full};
    --font-heading: ${({ theme }) => theme.fonts.heading};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-inter, ${({ theme }) => theme.fonts.body});
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-weight: ${({ theme }) => theme.fontWeights.normal};
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    line-height: 1.3;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h1 { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }
  h2 { font-size: ${({ theme }) => theme.fontSizes["2xl"]}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes.xl}; }
  h4 { font-size: ${({ theme }) => theme.fontSizes.lg}; }
  h5 { font-size: ${({ theme }) => theme.fontSizes.base}; }
  h6 { font-size: ${({ theme }) => theme.fontSizes.sm}; }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: 2px;
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all ${({ theme }) => theme.transitions.fast};

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) =>
  theme.spacing.md};
    transition: border-color ${({ theme }) => theme.transitions.fast};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.muted};
    }
  }

  ul, ol {
    padding-left: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  img {
    max-width: 100%;
    height: auto;
  }

  code {
    font-family: var(--font-mono, ${({ theme }) => theme.fonts.mono});
    font-size: 0.875em;
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    padding: 0.125rem 0.25rem;
    border-radius: ${({ theme }) => theme.radii.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  pre {
    font-family: var(--font-mono, ${({ theme }) => theme.fonts.mono});
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
    overflow-x: auto;
    border: 1px solid ${({ theme }) => theme.colors.border};
    margin-bottom: ${({ theme }) => theme.spacing.md};

    code {
      background: none;
      padding: 0;
      border: none;
      font-size: inherit;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  th, td {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) =>
  theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }

  .font-light { font-weight: ${({ theme }) => theme.fontWeights.light}; }
  .font-normal { font-weight: ${({ theme }) => theme.fontWeights.normal}; }
  .font-medium { font-weight: ${({ theme }) => theme.fontWeights.medium}; }
  .font-semibold { font-weight: ${({ theme }) => theme.fontWeights.semibold}; }
  .font-bold { font-weight: ${({ theme }) => theme.fontWeights.bold}; }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundSecondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.borderDark};
  }

  /* Loading animation */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }

  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }

  /* Focus ring for accessibility */
  .focus-ring:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Media queries */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    html {
      font-size: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default GlobalStyles;
