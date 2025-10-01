// src/app/dashboard/settings/style.jsx
"use client";
import styled from "styled-components";

export const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

// Vertical Settings layout
export const SettingsContainer = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

export const SettingsNav = styled.nav`
  position: sticky;
  top: ${({ theme }) => theme.spacing.xl};
  align-self: start;
`;

export const SettingsNavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const SettingsNavItem = styled.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.white : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  text-align: left;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primaryHover : theme.colors.surfaceHover};
    color: ${({ $active, theme }) =>
      $active ? theme.colors.text.white : theme.colors.text.primary};
  }
`;

export const SettingsContent = styled.div`
  min-width: 0;
`;

export const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

export const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const AvatarUpload = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  input {
    display: none;
  }
`;

export const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

export const RadioList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }

  input[type="radio"] {
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;
