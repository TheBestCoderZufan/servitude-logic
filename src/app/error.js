// src/app/error.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Button } from "@/components/ui";
import { FiRefreshCw, FiHome, FiAlertTriangle } from "react-icons/fi";
import { FaBug } from "react-icons/fa";

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ErrorContent = styled.div`
  text-align: center;
  max-width: 600px;
  width: 100%;
`;

const ErrorIcon = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.error}20 0%,
    ${({ theme }) => theme.colors.error}10 100%
  );
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.error};
  font-size: 48px;
`;

const ErrorTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ErrorDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  text-align: left;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
`;

const ErrorSummary = styled.summary`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const ErrorMessage = styled.pre`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  const handleRetry = () => {
    reset();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const formatErrorMessage = (error) => {
    if (error?.digest) {
      return `Error ID: ${error.digest}\n\nMessage: ${
        error.message || "An unexpected error occurred"
      }`;
    }
    return (
      error?.message || error?.toString() || "An unexpected error occurred"
    );
  };

  return (
    <ErrorContainer>
      <ErrorContent>
        <ErrorIcon>
          <FaBug />
        </ErrorIcon>

        <ErrorTitle>Something went wrong!</ErrorTitle>
        <ErrorDescription>
          We&apos;re sorry, but something unexpected happened. This error has
          been logged and we&apos;ll investigate the issue. You can try
          refreshing the page or go back home.
        </ErrorDescription>

        <ErrorDetails>
          <ErrorSummary>
            <FiAlertTriangle
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            View Error Details
          </ErrorSummary>
          <ErrorMessage>{formatErrorMessage(error)}</ErrorMessage>
        </ErrorDetails>

        <ActionButtons>
          <Button onClick={handleRetry}>
            <FiRefreshCw />
            Try Again
          </Button>
          <Button variant="outline" onClick={handleGoHome}>
            <FiHome />
            Go Home
          </Button>
        </ActionButtons>
      </ErrorContent>
    </ErrorContainer>
  );
}
