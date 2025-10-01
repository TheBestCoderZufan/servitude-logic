// src/app/admin/settings/style.jsx
"use client";
import styled from "styled-components";
import { Card, Avatar } from "@/components/ui";

// Styled components (keeping the existing ones from the original file)
const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0;
`;

const SettingsContainer = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const SettingsNav = styled.nav`
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    order: 2;
  }
`;

const SettingsNavCard = styled(Card)`
  position: sticky;
  top: ${({ theme }) => theme.spacing.xl};
`;

const SettingsNavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SettingsNavItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  background-color: ${({ $isactive, theme }) =>
    $isactive ? theme.colors.primary : "transparent"};
  color: ${({ $isactive, theme }) =>
    $isactive ? theme.colors.text.white : theme.colors.text.secondary};

  &:hover {
    background-color: ${({ $isactive, theme }) =>
      $isactive ? theme.colors.primaryHover : theme.colors.surfaceHover};
    color: ${({ $isactive, theme }) =>
      $isactive ? theme.colors.text.white : theme.colors.text.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SettingsContent = styled.div`
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    order: 1;
  }
`;

const SettingsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProfileImageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ProfileImage = styled(Avatar)`
  width: 80px;
  height: 80px;
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const ProfileImageUpload = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.white};
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  input {
    display: none;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationInfo = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NotificationDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.borderDark};
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const TeamMemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const TeamMemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TeamMemberName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TeamMemberEmail = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

export {
  PageHeader,
  PageTitle,
  PageDescription,
  SettingsContainer,
  SettingsNav,
  SettingsNavCard,
  SettingsNavList,
  SettingsNavItem,
  SettingsContent,
  SettingsSection,
  ProfileImageContainer,
  ProfileImageWrapper,
  ProfileImage,
  ProfileImageUpload,
  FormGrid,
  NotificationItem,
  NotificationInfo,
  NotificationTitle,
  NotificationDescription,
  ToggleSwitch,
  ToggleInput,
  ToggleSlider,
  TeamMemberItem,
  TeamMemberInfo,
  TeamMemberName,
  TeamMemberEmail,
  LoadingSpinner,
  ErrorMessage,
};
