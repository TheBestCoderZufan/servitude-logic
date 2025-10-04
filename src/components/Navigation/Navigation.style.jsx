// src/components/Navigation/Navigation.style.jsx
"use client";
import styled, { css } from "styled-components";
import Link from "next/link";
import { Button as UIButton } from "@/components/ui";

const NAV_HEIGHT = "4.5rem";

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${NAV_HEIGHT};
  padding: 0 ${({ theme }) => theme.spacing.md};
  backdrop-filter: blur(14px);
  background: ${({ theme }) => `${theme.colors.background}f0`};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.border}88`};
  box-shadow: 0 16px 40px -24px rgba(15, 23, 42, 0.35);
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  border: none;
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  transition: color 0.2s ease;
  border: none;
  &:hover {
    text-decoration: none;
    color: inherit;
    border: none;
  }

  &:focus {
    text-decoration: none;
    color: inherit;
    border: none;
    outline: none;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.background};
  }

  &:focus {
    outline: none;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: stretch;

  &:hover > div,
  &:focus-within > div {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const DropdownTriggerButton = styled(UIButton)`
  color: ${({ theme }) => theme.colors.text.white};
  text-decoration: none;

  &:hover:not(:disabled),
  &:focus,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.text.white};
    text-decoration: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: opacity ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base},
    visibility ${({ theme }) => theme.transitions.base};
  z-index: ${({ theme }) => theme.zIndices.dropdown};
`;

const dropdownItemStyles = css`
  display: block;
  width: 100%;
  background: transparent;
  border: 0;
  text-align: left;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
  }
`;

const DropdownItem = styled(Link)`
  ${dropdownItemStyles}
`;

const DropdownButtonItem = styled.button`
  ${dropdownItemStyles}
`;

const NavActionButton = styled(UIButton)`
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text.white};
  }
`;

export {
  Header,
  Logo,
  LogoLink,
  NavLinks,
  NavLink,
  AuthButtons,
  DropdownContainer,
  DropdownTriggerButton,
  DropdownMenu,
  DropdownItem,
  NavActionButton,
  DropdownButtonItem,
};
