// src/components/ui/HeroSectionComponent.style.jsx
"use client";
import styled, { keyframes } from "styled-components";
import Link from "next/link";
const heroGradientShift = keyframes`
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(var(--hero-shift, 2rem));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(calc(var(--hero-shift, 2rem) * -1));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const floatParticle = keyframes`
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(calc(var(--particle-shift, 1.5rem) * -1)) scale(1.15);
    opacity: 1;
  }
`;

/*
 const HeroSection = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    ${({ theme }) => `${theme.colors.accent.aurora}e6`} 0%,
    ${({ theme }) => `${theme.colors.accent.amethyst}e6`} 50%,
    ${({ theme }) => `${theme.colors.accent.aqua}e6`} 100%
  );
  background-size: 200% 200%;
  animation: ${heroGradientShift} 20s ease-in-out infinite;
  isolation: isolate;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-position: 50% 50%;
  }
`;
*/

const HeroSection = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  background: linear-gradient(
    135deg,
    ${({ theme }) => `${theme.colors.accent.aurora}e6`} 0%,
    ${({ theme }) => `${theme.colors.accent.amethyst}e6`} 50%,
    ${({ theme }) => `${theme.colors.accent.aqua}e6`} 100%
  );
  overflow: hidden;
  animation: ${heroGradientShift} 20s ease-in-out infinite;
  padding: 0 9rem;

  /* before */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      ${({ theme }) => `${theme.colors.accent.aurora}e6`} 0%,
      ${({ theme }) => `${theme.colors.accent.amethyst}e6`} 50%,
      ${({ theme }) => `${theme.colors.accent.aqua}e6`} 100%
    );
    background-size: 200% 200%;
    animation: ${heroGradientShift} 20s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-position: 50% 50%;
  }
`;

const HeroContent = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 720px;
  position: relative;
  z-index: 3;
  --hero-shift: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeInUp} 1s ease-out both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
  align-items: center;
`;

const HeroEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme }) => `${theme.colors.text.white}1a`};
  color: ${({ theme }) => theme.colors.text.white};
  border: 1px solid ${({ theme }) => `${theme.colors.text.white}33`};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: ${({ theme }) => theme.shadows.md};
  backdrop-filter: blur(10px);
  --hero-shift: ${({ theme }) => theme.spacing.lg};
  animation: ${slideInLeft} 1s ease-out 0.2s both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const HeroTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  /* font-size: clamp(
    ${({ theme }) => theme.fontSizes["3xl"]},
    8vw,
    ${({ theme }) => theme.fontSizes["5xl"]}
  ); */
  /* font-size: ${({ theme }) => theme.fontSizes["5xl"]}; */
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text.white};
  text-shadow: 0 4px 24px rgba(15, 23, 42, 0.35);
  animation: ${fadeInUp} 1s ease-out 0.4s both;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: clamp(
      ${({ theme }) => theme.fontSizes["4xl"]},
      5vw,
      ${({ theme }) => theme.fontSizes["5xl"]}
    );
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(
    ${({ theme }) => theme.fontSizes.lg},
    2vw,
    ${({ theme }) => theme.fontSizes["2xl"]}
  );
  line-height: 1.6;
  color: ${({ theme }) => `${theme.colors.text.white}e6`};
  max-width: 640px;
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  --hero-shift: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeInUp} 1s ease-out 0.6s both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const HeroActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: stretch;
  --hero-shift: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeInUp} 1s ease-out 0.8s both;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    align-items: center;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const PrimaryAction = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.xl}`};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.accent.coral} 0%,
    ${({ theme }) => theme.colors.accent.ember} 100%
  );
  color: ${({ theme }) => theme.colors.text.white};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  box-shadow: 0 14px 36px rgba(238, 90, 36, 0.45);
  transition: transform ${({ theme }) => theme.transitions.base},
    box-shadow ${({ theme }) => theme.transitions.base};
  &:focus-visible {
    outline: 3px solid ${({ theme }) => `${theme.colors.accent.emerald}99`};
    outline-offset: 4px;
  }
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 44px rgba(238, 90, 36, 0.55);
  }
`;

const SecondaryAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.xl}`};
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 2px solid ${({ theme }) => `${theme.colors.text.white}33`};
  color: ${({ theme }) => theme.colors.text.white};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  backdrop-filter: blur(12px);
  transition: transform ${({ theme }) => theme.transitions.base},
    background ${({ theme }) => theme.transitions.base};
  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => `${theme.colors.text.white}1f`};
    border-color: ${({ theme }) => `${theme.colors.text.white}55`};
  }
  &:focus-visible {
    outline: 3px solid ${({ theme }) => `${theme.colors.text.white}66`};
    outline-offset: 4px;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at 20% 50%,
      ${({ theme }) => `${theme.colors.text.white}19`} 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 80% 20%,
      ${({ theme }) => `${theme.colors.text.white}14`} 0%,
      transparent 60%
    ),
    radial-gradient(
      circle at 40% 80%,
      ${({ theme }) => `${theme.colors.text.white}12`} 0%,
      transparent 58%
    );
  z-index: 1;
  pointer-events: none;
`;

/*
 const HeroParticles = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
`;
*/

const HeroParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
`;

const HeroParticle = styled.div`
  position: absolute;
  width: ${({ theme }) => theme.spacing.xs};
  height: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => `${theme.colors.text.white}99`};
  left: ${({ $left }) => `${$left}%`};
  top: ${({ $top }) => `${$top}%`};
  --particle-shift: ${({ theme }) => theme.spacing.lg};
  animation: ${floatParticle} ${({ $duration, theme }) => `${$duration || 4}s`}
    ease-in-out infinite;
  animation-delay: ${({ $delay }) => `${$delay || 0}s`};
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export {
  HeroSection,
  HeroContent,
  HeroEyebrow,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  PrimaryAction,
  SecondaryAction,
  HeroOverlay,
  HeroParticles,
  HeroParticle,
};
