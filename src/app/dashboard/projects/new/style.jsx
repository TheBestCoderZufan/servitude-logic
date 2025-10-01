// src/app/dashboard/projects/new/style.jsx
"use client";
import styled from "styled-components";

/** Title: Page heading */
export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

/** Stepper: Simple step indicator container */
export const Stepper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

/** Step: Individual step badge */
export const Step = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.backgroundSecondary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.white : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

