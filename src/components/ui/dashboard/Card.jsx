// src/components/ui/dashboard/Card.jsx
"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * CardBase
 * Provides the foundational container styling for dashboard panels while
 * supporting hover affordances when `interactive` is enabled.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Card content.
 * @param {string} [props.className] - Optional Tailwind utility overrides.
 * @param {boolean} [props.interactive=false] - When true applies hover shadows.
 * @param {React.ComponentPropsWithoutRef<"div">} [props.rest] - Div props.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref.
 * @returns {JSX.Element}
 */
function CardBase({ children, className, interactive = false, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-border bg-surface text-foreground shadow-sm transition duration-200",
        "supports-[backdrop-filter]:bg-surface/90 supports-[backdrop-filter]:backdrop-blur",
        interactive ? "hover:border-primary/60 hover:shadow-lifted" : "",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

const Card = forwardRef(CardBase);

/**
 * CardHeader
 * Applies vertical spacing and flex alignment for section headings within a card.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Header content.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @returns {JSX.Element}
 */
export function CardHeader({ children, className, ...rest }) {
  return (
    <div className={cn("flex flex-col gap-2 px-6 pt-6", className)} {...rest}>
      {children}
    </div>
  );
}

/**
 * CardTitle
 * Styled heading element suitable for card headers.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Heading content.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @returns {JSX.Element}
 */
export function CardTitle({ children, className, ...rest }) {
  return (
    <h3 className={cn("font-heading text-lg font-semibold tracking-tight", className)} {...rest}>
      {children}
    </h3>
  );
}

/**
 * CardDescription
 * Provides subdued descriptive text below a card title.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Description content.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @returns {JSX.Element}
 */
export function CardDescription({ children, className, ...rest }) {
  return (
    <p className={cn("text-sm text-muted", className)} {...rest}>
      {children}
    </p>
  );
}

/**
 * CardContent
 * Wraps the body content for cards with consistent padding.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Body content.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @returns {JSX.Element}
 */
export function CardContent({ children, className, ...rest }) {
  return (
    <div className={cn("px-6 pb-6", className)} {...rest}>
      {children}
    </div>
  );
}

/**
 * CardFooter
 * Provides a soft top border and spacing suited for action rows.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Footer content.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @returns {JSX.Element}
 */
export function CardFooter({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border/80 bg-surface px-6 pb-6 pt-4",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export { Card };
