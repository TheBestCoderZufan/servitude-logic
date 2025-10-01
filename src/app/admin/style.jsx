// src/app/dashboard/style.jsx
"use client";
import styled from "styled-components";
import { Card, CardContent } from "@/components/ui";

const BURNDOWN_SEGMENT_COLORS = {
  approved: (theme) => theme.colors.success,
  review: (theme) => theme.colors.info,
  blocked: (theme) => theme.colors.error,
  remaining: (theme) => theme.colors.secondary,
};

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  /* grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); */
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatsCard = styled(Card)`
  position: relative;
  overflow: visible;
`;

const StatsCardContent = styled(CardContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatsInfo = styled.div`
  flex: 1;
`;

const StatsValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatsLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatsChange = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ $ispositive, theme }) =>
    $ispositive ? theme.colors.success : theme.colors.error};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatsIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background-color: ${({ color, theme }) => color || theme.colors.primary}20;
  color: ${({ color, theme }) => color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const RecentSection = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const QuickActions = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const QuickActionCard = styled(Card)`
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const QuickActionContent = styled(CardContent)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const QuickActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ color, theme }) => color || theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const QuickActionInfo = styled.div`
  flex: 1;
`;

const QuickActionTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const QuickActionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0;
`;

const ProjectItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ProjectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProjectName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ProjectClient = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ProjectProgress = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ProgressText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const TaskInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActivityFeed = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ color, theme }) =>
    color || theme.colors.backgroundSecondary};
  color: ${({ color, theme }) => color || theme.colors.text.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ActivityTime = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const BurndownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const BurndownBar = styled.div`
  width: 100%;
  height: 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surfaceHover};
  overflow: hidden;
  display: flex;
`;

const BurndownSegment = styled.div`
  height: 100%;
  background: ${({ theme, $tone }) =>
    (BURNDOWN_SEGMENT_COLORS[$tone] || ((t) => t.colors.primary))(theme)};
  width: ${({ $width }) => `${Math.min(Math.max($width, 0), 100)}%`};
  transition: width ${({ theme }) => theme.transitions.fast};
`;

const SummaryPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $variant }) =>
    $variant === "positive"
      ? theme.colors.successLight
      : $variant === "warning"
      ? theme.colors.warningLight
      : theme.colors.errorLight};
  color: ${({ theme, $variant }) =>
    $variant === "positive"
      ? theme.colors.success
      : $variant === "warning"
      ? theme.colors.warning
      : theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const DeliverableList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DeliverableItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const DeliverableTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DeliverableMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetricsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
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
  flex: 1;
`;

export {
  DashboardGrid,
  StatsInfo,
  StatsValue,
  StatsLabel,
  StatsChange,
  StatsIcon,
  ContentGrid,
  RecentSection,
  QuickActions,
  QuickActionIcon,
  QuickActionInfo,
  QuickActionTitle,
  QuickActionDescription,
  ProjectItem,
  ProjectInfo,
  ProjectName,
  ProjectClient,
  ProjectProgress,
  ProgressText,
  TaskItem,
  TaskInfo,
  TaskTitle,
  TaskMeta,
  ActivityFeed,
  ActivityItem,
  ActivityIcon,
  ActivityContent,
  ActivityText,
  ActivityTime,
  HeaderActions,
  PageTitle,
  PageDescription,
  StatsCard,
  StatsCardContent,
  QuickActionCard,
  QuickActionContent,
  BurndownWrapper,
  BurndownBar,
  BurndownSegment,
  SummaryPill,
  DeliverableList,
  DeliverableItem,
  DeliverableTitle,
  DeliverableMetaRow,
  MetricsGrid,
};
