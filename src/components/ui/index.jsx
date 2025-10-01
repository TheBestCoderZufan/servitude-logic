// src/components/ui/index.js
"use client";
import styled, { css } from "styled-components";
import { FiLoader } from "react-icons/fi";

// Card Component
export const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  transition: box-shadow ${({ theme }) => theme.transitions.fast};

  ${({ hover, theme }) =>
    hover &&
    css`
      &:hover {
        box-shadow: ${theme.shadows.md};
      }
    `}
`;

export const CardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const CardDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: 0;
`;

export const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const CardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

// Button Components
export const buttonVariants = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text.white};
    border: 1px solid ${({ theme }) => theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryHover};
      border-color: ${({ theme }) => theme.colors.primaryHover};
    }
  `,
  secondary: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
      border-color: ${({ theme }) => theme.colors.borderDark};
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.text.white};
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.secondary};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.text.white};
    border: 1px solid ${({ theme }) => theme.colors.error};

    &:hover:not(:disabled) {
      background-color: #dc2626;
      border-color: #dc2626;
    }
  `,
  success: css`
    background-color: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.text.white};
    border: 1px solid ${({ theme }) => theme.colors.success};

    &:hover:not(:disabled) {
      background-color: #059669;
      border-color: #059669;
    }
  `,
};

export const buttonSizes = {
  sm: css`
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    height: 32px;
  `,
  md: css`
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.fontSizes.base};
    height: 40px;
  `,
  lg: css`
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    height: 48px;
  `,
};

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  ${({ $variant = "primary" }) => buttonVariants[$variant]}
  ${({ size = "md" }) => buttonSizes[size]}

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

// Loading Spinner
export const Spinner = styled(FiLoader)`
  animation: spin 1s linear infinite;
  width: ${({ size = "16" }) => size}px;
  height: ${({ size = "16" }) => size}px;
`;

// Badge Component
const badgeVariants = {
  default: css`
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    color: ${({ theme }) => theme.colors.text.secondary};
  `,
  primary: css`
    background-color: ${({ theme }) => theme.colors.infoLight};
    color: ${({ theme }) => theme.colors.primary};
  `,
  success: css`
    background-color: ${({ theme }) => theme.colors.successLight};
    color: ${({ theme }) => theme.colors.success};
  `,
  warning: css`
    background-color: ${({ theme }) => theme.colors.warningLight};
    color: ${({ theme }) => theme.colors.warning};
  `,
  error: css`
    background-color: ${({ theme }) => theme.colors.errorLight};
    color: ${({ theme }) => theme.colors.error};
  `,
  planning: css`
    background-color: #f3e8ff;
    color: ${({ theme }) => theme.colors.status.planning};
  `,
  inProgress: css`
    background-color: ${({ theme }) => theme.colors.infoLight};
    color: ${({ theme }) => theme.colors.status.inProgress};
  `,
  completed: css`
    background-color: ${({ theme }) => theme.colors.successLight};
    color: ${({ theme }) => theme.colors.status.completed};
  `,
  onHold: css`
    background-color: ${({ theme }) => theme.colors.warningLight};
    color: ${({ theme }) => theme.colors.status.onHold};
  `,
  cancelled: css`
    background-color: ${({ theme }) => theme.colors.errorLight};
    color: ${({ theme }) => theme.colors.status.cancelled};
  `,
};

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-transform: capitalize;

  ${({ variant = "default" }) => badgeVariants[variant]}
`;

// Input Components
export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    color: ${({ theme }) => theme.colors.text.muted};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color ${({ theme }) => theme.transitions.fast};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    color: ${({ theme }) => theme.colors.text.muted};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    color: ${({ theme }) => theme.colors.text.muted};
    cursor: not-allowed;
  }
`;

// Form Components
export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const HelperText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: 0;
`;

export const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: 0;
`;

// Progress Component
export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background-color: ${({ theme, variant = "primary" }) => {
    switch (variant) {
      case "success":
        return theme.colors.success;
      case "warning":
        return theme.colors.warning;
      case "error":
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  border-radius: inherit;
  transition: width ${({ theme }) => theme.transitions.base};
  width: ${({ progress = 0 }) => Math.min(Math.max(progress, 0), 100)}%;
`;

// Avatar Component
export const Avatar = styled.div`
  width: ${({ size = "40" }) => size}px;
  height: ${({ size = "40" }) => size}px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ size = "40" }) => (size > 32 ? "14px" : "12px")};
  flex-shrink: 0;
`;

// Table Components
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TableHeader = styled.thead`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const TableHead = styled.th`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  text-align: left;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

// Empty State Component
export const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing["4xl"]};
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const EmptyStateTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const EmptyStateDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

// Loading State
export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing["2xl"]};
  color: ${({ theme }) => theme.colors.text.muted};
  gap: ${({ theme }) => theme.spacing.md};
`;

// Divider
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

// Status Indicators
export const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme, status = "default" }) => {
    switch (status) {
      case "success":
        return theme.colors.success;
      case "warning":
        return theme.colors.warning;
      case "error":
        return theme.colors.error;
      case "info":
        return theme.colors.info;
      default:
        return theme.colors.text.muted;
    }
  }};
  flex-shrink: 0;
`;
