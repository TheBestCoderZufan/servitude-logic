// src/components/ui/dashboard/Table.jsx
"use client";
import React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Table
 * Responsive table wrapper using Tailwind utilities and CSS variables for theming.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Table content.
 * @param {string} [props.className] - Optional Tailwind overrides.
 * @returns {JSX.Element}
 */
export function Table({ children, className, ...rest }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/70">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "min-w-full border-collapse bg-surface text-sm text-foreground",
            className,
          )}
          {...rest}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

/**
 * TableHeader
 * Wrapper for thead element with subtle background contrast.
 */
export function TableHeader({ children, className, ...rest }) {
  return (
    <thead className={cn("bg-surface/70", className)} {...rest}>
      {children}
    </thead>
  );
}

/**
 * TableBody component.
 */
export function TableBody({ children, className, ...rest }) {
  return (
    <tbody className={cn("divide-y divide-border/60", className)} {...rest}>
      {children}
    </tbody>
  );
}

/**
 * TableRow component.
 */
export function TableRow({ children, className, ...rest }) {
  return (
    <tr className={cn("transition hover:bg-accent-soft/60", className)} {...rest}>
      {children}
    </tr>
  );
}

/**
 * TableHead cell component.
 */
export function TableHead({ children, className, ...rest }) {
  return (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted",
        className,
      )}
      scope="col"
      {...rest}
    >
      {children}
    </th>
  );
}

/**
 * TableCell component.
 */
export function TableCell({ children, className, ...rest }) {
  return (
    <td className={cn("px-6 py-4 text-sm text-foreground/80", className)} {...rest}>
      {children}
    </td>
  );
}
