// src/components/Loading/SuspenseFallback.jsx
"use client";
import styled, { keyframes } from "styled-components";

/** @module components/Loading/SuspenseFallback */

const slide = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

import { theme as lightTheme } from "@/styles/theme";

const BarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(${({ theme }) => (theme?.spacing?.xs || lightTheme.spacing.xs)} / 2); /* ~2px */
  background: transparent;
  z-index: ${({ theme }) => (theme?.zIndices?.banner ?? lightTheme.zIndices.banner)};
`;

const Bar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  border-radius: ${({ theme }) => (theme?.radii?.full || lightTheme.radii.full)};
  background: linear-gradient(
    90deg,
    ${({ theme }) => (theme?.colors?.primaryLight || lightTheme.colors.primaryLight)} 0%,
    ${({ theme }) => (theme?.colors?.primary || lightTheme.colors.primary)} 50%,
    ${({ theme }) => (theme?.colors?.primaryLight || lightTheme.colors.primaryLight)} 100%
  );
  animation: ${slide} 1.2s ease-in-out infinite;
`;

const SrOnly = styled.span`
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden; clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap; border: 0; padding: 0; margin: -1px;
`;

/**
 * Very lightweight, non-intrusive Suspense fallback.
 * Renders a thin animated progress bar at the top of the viewport.
 *
 * @returns {JSX.Element} The fallback element.
 */
export default function SuspenseFallback() {
  return (
    <BarContainer role="status" aria-live="polite" aria-label="Loading">
      <Bar />
      <SrOnly>Loading&hellip;</SrOnly>
    </BarContainer>
  );
}
