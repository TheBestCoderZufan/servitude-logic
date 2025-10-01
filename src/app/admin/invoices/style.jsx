// src/app/invoices/style.jsx
"use client";
import styled from "styled-components";
import { Card, CardContent, Button, Input, Select } from "@/components/ui";
import { FiSearch, FiLoader } from "react-icons/fi";

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const HeaderContent = styled.div`
  flex: 1;
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

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  /* Use theme tokens to support dark mode */
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.surface} 0%,
    ${({ theme }) => theme.colors.backgroundSecondary} 100%
  );
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const StatContent = styled(CardContent)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatChange = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ $ispositive, theme }) =>
    $ispositive ? theme.colors.success : theme.colors.error};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background-color: ${({ color }) => color || "#3b82f6"}20;
  color: ${({ color }) => color || "#3b82f6"};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 300px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: none;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  width: 16px;
  height: 16px;
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
`;

const FilterSelect = styled(Select)`
  min-width: 150px;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ViewButton = styled(Button)`
  ${({ $isactive, theme }) =>
    $isactive &&
    `
      background-color: ${theme.colors.primary};
      color: ${theme.colors.text.white};
    `}
`;

const InvoicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InvoiceCard = styled(Card)`
  position: relative;
  transition: all ${({ theme }) => theme.transitions.medium};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: ${({ status, theme }) => {
    switch (status) {
      case "PAID":
        return theme.colors.success;
      case "SENT":
        return theme.colors.info;
      case "OVERDUE":
        return theme.colors.error;
      case "DRAFT":
        return theme.colors.text.muted;
      default:
        return theme.colors.border;
    }
  }};
  border-radius: ${({ theme }) => theme.radii.lg} 0 0
    ${({ theme }) => theme.radii.lg};
`;

const InvoiceCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InvoiceInfo = styled.div`
  flex: 1;
`;

const InvoiceNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InvoiceClient = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InvoiceAmount = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InvoiceMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InvoiceMetaItem = styled.div``;

const InvoiceMetaLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InvoiceMetaValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const DueDateIndicator = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  ${({ status, theme }) => {
    switch (status) {
      case "overdue":
        return `
          background-color: ${theme.colors.errorLight};
          color: ${theme.colors.error};
        `;
      case "due-soon":
        return `
          background-color: ${theme.colors.warningLight};
          color: ${theme.colors.warning};
        `;
      default:
        return `
          background-color: ${theme.colors.backgroundSecondary};
          color: ${theme.colors.text.muted};
        `;
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.muted};
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoadingSpinner = styled(FiLoader)`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.error};
`;

export {
  PageHeader,
  HeaderContent,
  PageTitle,
  PageDescription,
  HeaderActions,
  StatsGrid,
  StatInfo,
  StatValue,
  StatLabel,
  StatChange,
  StatIcon,
  FiltersBar,
  SearchContainer,
  ViewToggle,
  InvoicesGrid,
  StatusIndicator,
  InvoiceCardHeader,
  InvoiceInfo,
  InvoiceNumber,
  InvoiceClient,
  InvoiceAmount,
  InvoiceMeta,
  InvoiceMetaItem,
  InvoiceMetaLabel,
  InvoiceMetaValue,
  DueDateIndicator,
  LoadingContainer,
  ErrorContainer,
  LoadingSpinner,
  StatCard,
  StatContent,
  SearchIcon,
  SearchInput,
  FilterSelect,
  ViewButton,
  InvoiceCard,
};
