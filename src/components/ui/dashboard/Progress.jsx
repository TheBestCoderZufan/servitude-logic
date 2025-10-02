// src/components/ui/dashboard/Progress.jsx
"use client";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * ProgressToneMap
 * Maps tone to Tailwind color utilities for the progress indicator.
 * @type {Record<string, string>}
 */
const ProgressToneMap = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  neutral: "bg-accent",
};

/**
 * ProgressBar
 * Provides the track element for percentage-based progress indicators.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Indicator element.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @returns {JSX.Element}
 */
export function ProgressBar({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-border/60",
        "supports-[backdrop-filter]:bg-border/40",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * ProgressFill
 * Renders the visual indicator for a progress bar using CSS transforms instead
 * of width calculations to leverage GPU acceleration.
 *
 * @param {object} props - Component props.
 * @param {number} [props.value=0] - Progress value from 0 to 100.
 * @param {string} [props.tone="primary"] - Visual tone of the indicator.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @returns {JSX.Element}
 */
export function ProgressFill({ value = 0, tone = "primary", className, ...rest }) {
  const clamped = useMemo(() => Math.min(100, Math.max(0, value)), [value]);
  const variant = ProgressToneMap[tone] || ProgressToneMap.primary;
  return (
    <div
      className={cn("h-full origin-left rounded-full transition-transform duration-200 ease-out", variant, className)}
      style={{ transform: `scaleX(${clamped / 100})` }}
      {...rest}
    />
  );
}
