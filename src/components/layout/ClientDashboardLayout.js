// src/components/layout/ClientDashboardLayout.js
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { FiChevronDown, FiLogOut, FiMoon, FiSettings, FiSun } from "react-icons/fi";
import appInfo from "@/data/appInfo.js";
import { navItems } from "@/data/navigation/clientNavigationData";
import ProjectSelector from "@/components/ProjectSelector/ProjectSelector";
import { Avatar, Button } from "@/components/ui/dashboard";
import { cn } from "@/lib/utils/cn";

/**
 * ClientDashboardLayout
 * Provides the authenticated client dashboard shell with responsive navigation,
 * theme toggling, and a Clerk-backed user menu.
 *
 * @param {{ children: React.ReactNode }} props - Component props.
 * @param {React.ReactNode} props.children - Route content.
 * @returns {JSX.Element}
 */
export default function ClientDashboardLayout({ children }) {
  const { user, isLoaded } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = useMemo(() => {
    const fullName = user?.fullName;
    if (!fullName) {
      return "";
    }
    return fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  }, [user?.fullName]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBrandActivate = (event) => {
    event.preventDefault();
    router.push("/dashboard");
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const isActive = (href, exact = false) => {
    if (!pathname) {
      return false;
    }
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            <button
              type="button"
              onClick={handleBrandActivate}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  handleBrandActivate(event);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-lg font-semibold text-primary transition hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Go to dashboard"
            >
              {appInfo.name}
            </button>
            <nav className="hidden flex-1 items-center md:flex">
              <ProjectSelector />
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={resolvedTheme === "dark" ? "Activate light theme" : "Activate dark theme"}
            >
              {resolvedTheme === "dark" ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Avatar size={32} className="bg-primary/90">
                  {isLoaded ? initials : ""}
                </Avatar>
                <span className="hidden sm:inline-block max-w-[12ch] truncate text-sm text-foreground">
                  {isLoaded && user ? user.fullName : ""}
                </span>
                <FiChevronDown aria-hidden className="text-muted" />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 rounded-2xl border border-border bg-surface/95 p-2 text-sm shadow-lg"
                >
                  <Link
                    href="/dashboard/settings"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-muted transition hover:bg-accent-soft hover:text-foreground"
                  >
                    <FiSettings aria-hidden />
                    Settings
                  </Link>
                  <SignOutButton>
                    <Button
                      variant="secondary"
                      className="mt-1 w-full justify-start gap-2 rounded-xl px-3 py-2 text-muted hover:text-foreground"
                    >
                      <FiLogOut aria-hidden />
                      Sign Out
                    </Button>
                  </SignOutButton>
                </div>
              )}
            </div>
          </div>
        </div>
        <nav className="border-t border-border/60 bg-surface/60">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 lg:px-6">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                className={cn(
                  "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive(item.href, Boolean(item.exact))
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-surface text-muted hover:border-primary/40 hover:text-primary",
                )}
                onClick={() => router.push(item.href)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-6 lg:py-10">
        {children}
      </main>
    </div>
  );
}
/** @module components/layout/ClientDashboardLayout */
