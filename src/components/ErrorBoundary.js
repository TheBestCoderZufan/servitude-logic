// src/components/ErrorBoundary.js
"use client";
import React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui";
import { FiRefreshCw, FiAlertTriangle, FiHome } from "react-icons/fi";

const ErrorBoundaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: ${({ theme }) => theme.spacing["2xl"]};
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  margin: ${({ theme }) => theme.spacing.lg};
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
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
  font-size: 32px;
`;

const ErrorTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 400px;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, title, message } = this.props;

      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <ErrorBoundaryContainer>
          <ErrorIcon>
            <FiAlertTriangle />
          </ErrorIcon>
          <ErrorTitle>{title || "Something went wrong"}</ErrorTitle>
          <ErrorMessage>
            {message ||
              "This component encountered an error. Please try refreshing or contact support if the problem persists."}
          </ErrorMessage>
          <ActionButtons>
            <Button onClick={this.handleRetry}>
              <FiRefreshCw />
              Try Again
            </Button>
            <Button variant="outline" onClick={this.handleGoHome}>
              <FiHome />
              Go Home
            </Button>
          </ActionButtons>
        </ErrorBoundaryContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Error State Components for specific scenarios
export const EmptyState = ({
  icon: Icon = FiAlertTriangle,
  title = "No data found",
  description = "There's nothing here yet.",
  action,
  actionText = "Get Started",
  actionIcon: ActionIcon = FiRefreshCw,
}) => (
  <ErrorBoundaryContainer>
    <ErrorIcon style={{ backgroundColor: "#f8fafc", color: "#64748b" }}>
      <Icon />
    </ErrorIcon>
    <ErrorTitle style={{ color: "#64748b" }}>{title}</ErrorTitle>
    <ErrorMessage>{description}</ErrorMessage>
    {action && (
      <Button onClick={action}>
        <ActionIcon />
        {actionText}
      </Button>
    )}
  </ErrorBoundaryContainer>
);

export const NetworkError = ({ onRetry }) => (
  <ErrorBoundaryContainer>
    <ErrorIcon>
      <FiAlertTriangle />
    </ErrorIcon>
    <ErrorTitle>Connection Error</ErrorTitle>
    <ErrorMessage>
      Unable to connect to the server. Please check your internet connection and
      try again.
    </ErrorMessage>
    <ActionButtons>
      <Button onClick={onRetry}>
        <FiRefreshCw />
        Retry
      </Button>
    </ActionButtons>
  </ErrorBoundaryContainer>
);

export const PermissionError = ({ onGoHome }) => (
  <ErrorBoundaryContainer>
    <ErrorIcon>
      <FiAlertTriangle />
    </ErrorIcon>
    <ErrorTitle>Access Denied</ErrorTitle>
    <ErrorMessage>
      You don&apos;t have permission to view this content. Please contact your
      administrator.
    </ErrorMessage>
    <ActionButtons>
      <Button onClick={onGoHome}>
        <FiHome />
        Go Home
      </Button>
    </ActionButtons>
  </ErrorBoundaryContainer>
);

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

// Hook for error handling
export const useErrorHandler = () => {
  const handleError = (error, errorInfo) => {
    // Log to error reporting service
    console.error("Error caught by useErrorHandler:", error, errorInfo);

    // You can extend this to send errors to a monitoring service
    // like Sentry, LogRocket, etc.
  };

  return { handleError };
};
