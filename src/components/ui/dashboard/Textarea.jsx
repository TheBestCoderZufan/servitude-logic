// src/components/ui/dashboard/Textarea.jsx
"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * TextareaBase
 * Styled textarea matching the dashboard input theming.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @param {React.ComponentPropsWithoutRef<"textarea">} props.rest - Native textarea props.
 * @param {React.Ref<HTMLTextAreaElement>} ref - Forwarded ref.
 * @returns {JSX.Element}
 */
function TextareaBase({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "block w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm",
        "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        "min-h-[120px] resize-y",
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Textarea
 * Forward-ref wrapper exposing the themed textarea component.
 */
const Textarea = forwardRef(TextareaBase);

export { Textarea };
