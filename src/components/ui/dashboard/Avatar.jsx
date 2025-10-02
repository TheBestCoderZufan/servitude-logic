// src/components/ui/dashboard/Avatar.jsx
"use client";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Avatar
 * Circular container for initials or icons that adapts to light and dark themes
 * using CSS custom properties rather than inline colors.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Avatar content (initials or icon).
 * @param {number|string} [props.size=40] - Pixel size or CSS dimension value.
 * @param {string} [props.className] - Optional Tailwind utility overrides.
 * @returns {JSX.Element}
 */
export function Avatar({ children, size = 40, className, ...rest }) {
  const dimension = useMemo(() => (typeof size === "number" ? `${size}px` : size), [size]);
  const fontSize = useMemo(() => {
    if (typeof size === "number") {
      return `${Math.max(12, Math.round(size / 2.8))}px`;
    }
    return undefined;
  }, [size]);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold uppercase",
        "shadow-sm",
        className,
      )}
      style={{ width: dimension, height: dimension, fontSize }}
      {...rest}
    >
      {children}
    </div>
  );
}
