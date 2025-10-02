// src/components/ui/dashboard/Badge.jsx
"use client";
import React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * @typedef {"default"|"primary"|"success"|"warning"|"error"|"info"|"outline"|"planning"|"inProgress"|"completed"|"onHold"|"cancelled"} BadgeVariant
 */

/**
 * BADGE_VARIANTS
 * Maps semantic badge variants to Tailwind utility groupings driven by CSS
 * custom properties so the badges respond to theme changes automatically.
 * @type {Record<BadgeVariant, string>}
 */
const BADGE_VARIANTS = {
  default: "border border-border bg-surface text-muted",
  primary: "border border-info/25 bg-info-soft text-info",
  success: "border border-success/25 bg-success-soft text-success",
  warning: "border border-warning/25 bg-warning-soft text-warning",
  error: "border border-error/25 bg-error-soft text-error",
  info: "border border-info/25 bg-info-soft text-info",
  outline: "border border-border text-foreground",
  planning: "border border-transparent bg-status-planning-soft text-status-planning",
  inProgress: "border border-transparent bg-status-in-progress-soft text-status-in-progress",
  completed: "border border-transparent bg-status-completed-soft text-status-completed",
  onHold: "border border-transparent bg-status-on-hold-soft text-status-on-hold",
  cancelled: "border border-transparent bg-status-cancelled-soft text-status-cancelled",
};

/**
 * Badge
 * Compact status label component with baked-in semantic color variants.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Badge text.
 * @param {BadgeVariant} [props.variant="default"] - Visual variant to render.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @param {React.ComponentPropsWithoutRef<"span">} [props.rest] - Span props.
 * @returns {JSX.Element}
 */
export function Badge({ children, variant = "default", className, ...rest }) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize",
        "transition-colors duration-150",
        variantClass,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
