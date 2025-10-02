// src/components/ui/dashboard/Select.jsx
"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * SelectBase
 * Provides a styled select element mirroring the dashboard input aesthetic.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @param {React.ComponentPropsWithoutRef<"select">} props.rest - Native select props.
 * @param {React.Ref<HTMLSelectElement>} ref - Forwarded ref.
 * @returns {JSX.Element}
 */
function SelectBase({ className, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "block w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Select
 * Forward-ref wrapper around the themed select input.
 */
const Select = forwardRef(SelectBase);

export { Select };
