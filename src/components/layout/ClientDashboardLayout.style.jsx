// src/components/layout/ClientDashboardLayout.style.jsx
"use client";
import styled from "styled-components";

export const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const TopBar = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  cursor: pointer;
  user-select: none;
  outline: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}33;
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

export const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ContentArea = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const NavBar = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: ${({ theme }) => theme.spacing.lg};
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-left: 0;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

export const NavLinkButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.white : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primaryHover : theme.colors.surfaceHover};
    color: ${({ $active, theme }) =>
      $active ? theme.colors.text.white : theme.colors.text.primary};
  }
`;

export const SubNavBar = styled.nav`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
`;
// User menu dropdown for client top bar
export const UserMenu = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export const UserButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const UserName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

export const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.sm};
  min-width: 200px;
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  display: none;

  ${UserMenu}:hover &,
  ${UserMenu}:focus-within & {
    display: block;
  }
`;

export const DropdownItem = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;
// src/components/layout/ClientDashboardLayout.style.jsx
