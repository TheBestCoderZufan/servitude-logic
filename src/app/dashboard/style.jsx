"use client";
import { Card, Button } from "@/components/ui";
import styled from "styled-components";

const BURNDOWN_SEGMENT_COLORS = {
  approved: (theme) => theme.colors.success,
  review: (theme) => theme.colors.info,
  blocked: (theme) => theme.colors.error,
  remaining: (theme) => theme.colors.secondary,
};

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const TitleGroup = styled.div``;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const StatIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background-color: ${({ color }) => color}20;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ActionButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const BurndownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
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
  width: ${({ $width }) => `${Math.min(Math.max($width, 0), 100)}%`};
  background: ${({ theme, $tone }) =>
    (BURNDOWN_SEGMENT_COLORS[$tone] || ((t) => t.colors.primary))(theme)};
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
  gap: ${({ theme }) => theme.spacing.md};
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

const DeliverableDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PendingRequestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PendingRequestCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PendingRequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PendingRequestTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PendingRequestMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const PendingRequestFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

export {
  PageHeader,
  TitleGroup,
  PageTitle,
  PageSubtitle,
  StatsGrid,
  StatCard,
  StatRow,
  StatValue,
  StatLabel,
  StatIcon,
  QuickActions,
  ActionButton,
  Grid,
  SectionTitle,
  List,
  ListItem,
  ItemMeta,
  BurndownWrapper,
  BurndownBar,
  BurndownSegment,
  SummaryPill,
  DeliverableList,
  DeliverableItem,
  DeliverableDetails,
  PendingRequestsGrid,
  PendingRequestCard,
  PendingRequestHeader,
  PendingRequestTitle,
  PendingRequestMeta,
  PendingRequestFooter,
};
