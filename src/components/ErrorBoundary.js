// src/components/ErrorBoundary.js
"use client";
import React from "react";
import { Button } from "@/components/ui/dashboard";
import { FiRefreshCw, FiAlertTriangle, FiHome } from "react-icons/fi";

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
        <div className="m-6 flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-border bg-surface p-12 text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-3xl text-error">
            <FiAlertTriangle />
          </div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {title || "Something went wrong"}
          </h2>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-muted">
            {message ||
              "This component encountered an error. Please try refreshing or contact support if the problem persists."}
          </p>
          <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button onClick={this.handleRetry} variant="primary" className="rounded-xl">
              <FiRefreshCw className="mr-2" />
              Try Again
            </Button>
            <Button variant="secondary" onClick={this.handleGoHome} className="rounded-xl">
              <FiHome className="mr-2" />
              Go Home
            </Button>
          </div>
        </div>
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
  <div className="m-6 flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-border bg-surface p-12 text-center">
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface/60 text-xl text-muted">
      <Icon />
    </div>
    <h2 className="mb-3 text-lg font-semibold text-muted">{title}</h2>
    <p className="mb-6 max-w-md text-sm leading-relaxed text-muted">{description}</p>
    {action && (
      <Button onClick={action} variant="primary" className="rounded-xl">
        <ActionIcon className="mr-2" />
        {actionText}
      </Button>
    )}
  </div>
);

export const NetworkError = ({ onRetry }) => (
  <div className="m-6 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-border bg-surface p-12 text-center">
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-3xl text-error">
      <FiAlertTriangle />
    </div>
    <h2 className="mb-4 text-xl font-semibold text-foreground">Connection Error</h2>
    <p className="mb-6 max-w-md text-sm leading-relaxed text-muted">
      Unable to connect to the server. Please check your internet connection and
      try again.
    </p>
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button onClick={onRetry} variant="primary" className="rounded-xl">
        <FiRefreshCw className="mr-2" />
        Retry
      </Button>
    </div>
  </div>
);

export const PermissionError = ({ onGoHome }) => (
  <div className="m-6 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-border bg-surface p-12 text-center">
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-3xl text-error">
      <FiAlertTriangle />
    </div>
    <h2 className="mb-4 text-xl font-semibold text-foreground">Access Denied</h2>
    <p className="mb-6 max-w-md text-sm leading-relaxed text-muted">
      You don&apos;t have permission to view this content. Please contact your
      administrator.
    </p>
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button onClick={onGoHome} variant="primary" className="rounded-xl">
        <FiHome className="mr-2" />
        Go Home
      </Button>
    </div>
  </div>
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
