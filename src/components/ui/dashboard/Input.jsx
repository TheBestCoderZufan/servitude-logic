// src/components/ui/dashboard/Input.jsx
"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * InputBase
 * Provides a themed text input aligned with Shadcn defaults while consuming the
 * project&apos;s CSS variables for consistent dark-mode support.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @param {React.ComponentPropsWithoutRef<"input">} props.rest - Native input props.
 * @param {React.Ref<HTMLInputElement>} ref - Forwarded ref.
 * @returns {JSX.Element}
 */
function InputBase({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "block w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground shadow-sm",
        "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Input
 * Forward-ref wrapper exposing the themed input component.
 */
const Input = forwardRef(InputBase);

export { Input };
