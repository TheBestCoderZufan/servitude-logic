// src/components/ui/shadcn/Button.jsx
"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const VARIANT_STYLES = {
  primary:
    "inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lifted transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  secondary:
    "inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-foreground shadow-sm transition hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ghost:
    "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-foreground transition hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
};

const SIZE_STYLES = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

/**
 * Button
 * Accessible button primitive inspired by the Shadcn UI generator, providing
 * Tailwind variants for consistent styling.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Button label/content.
 * @param {"primary"|"secondary"|"ghost"} [props.variant="primary"] - Visual variant.
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Sizing preset.
 * @param {string} [props.className] - Optional extra class names.
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} [props.rest] - Native button props.
 * @returns {JSX.Element}
 */
const Button = forwardRef(function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...rest
}, ref) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button ref={ref} className={cn(variantClass, sizeClass, className)} {...rest}>
      {children}
    </button>
  );
});

export default Button;
