// src/app/error.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/dashboard";
import { FiRefreshCw, FiHome, FiAlertTriangle } from "react-icons/fi";
import { FaBug } from "react-icons/fa";

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
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface px-8 py-12 text-center shadow-lg">
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-error/10 text-4xl text-error">
          <FaBug />
        </div>

        <h1 className="mb-4 text-3xl font-bold text-foreground">Something went wrong!</h1>
        <p className="mb-8 text-base leading-relaxed text-muted">
          We&apos;re sorry, but something unexpected happened. This error has
          been logged and we&apos;ll investigate the issue. You can try
          refreshing the page or go back home.
        </p>

        <details className="mx-auto mb-8 w-full max-w-xl rounded-2xl border border-border bg-background p-4 text-left">
          <summary className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-foreground transition hover:bg-surface">
            <FiAlertTriangle />
            View Error Details
          </summary>
          <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-surface/80 p-4 text-xs text-muted">
            {formatErrorMessage(error)}
          </pre>
        </details>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleRetry} variant="primary" className="rounded-xl">
            <FiRefreshCw className="mr-2" />
            Try Again
          </Button>
          <Button variant="secondary" onClick={handleGoHome} className="rounded-xl">
            <FiHome className="mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
