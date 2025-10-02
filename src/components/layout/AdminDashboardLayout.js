// src/components/layout/AdminDashboardLayout.js
"use client";

/**
 * @module components/layout/AdminDashboardLayout
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSettings,
  FiSun,
  FiX,
} from "react-icons/fi";
import { navigationItems } from "@/data/navigation/adminNavigation.data";
import appInfo from "@/data/appInfo.js";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

const SIDEBAR_STORAGE_KEY = "adminSidebarCollapsed";

/**
 * AdminDashboardLayout renders the admin portal chrome (sidebar + top bar)
 * using Tailwind utility classes and next-themes for color mode.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Admin route content.
 * @param {string} [props.activeTab="dashboard"] - Active navigation tab.
 * @returns {JSX.Element}
 */
export default function AdminDashboardLayout({ children, activeTab = "dashboard" }) {
  const { user, isLoaded } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch (_) {
      // Ignore storage failures
    }
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
    return undefined;
  }, [isUserMenuOpen]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch (_) {
        // Ignore storage failures
      }
      return next;
    });
  }, []);

  const openMobileMenu = useCallback(() => setIsMobileOpen(true), []);
  const closeMobileMenu = useCallback(() => setIsMobileOpen(false), []);

  const toggleTheme = useCallback(() => {
    if (!mounted) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [mounted, resolvedTheme, setTheme]);

  const themeIcon = useMemo(() => {
    if (!mounted) return <FiMoon className="h-5 w-5" aria-hidden="true" />;
    return resolvedTheme === "dark" ? (
      <FiSun className="h-5 w-5" aria-hidden="true" />
    ) : (
      <FiMoon className="h-5 w-5" aria-hidden="true" />
    );
  }, [mounted, resolvedTheme]);

  const initials = useMemo(() => (user?.fullName ? getInitials(user.fullName) : "A"), [user?.fullName]);
  const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Admin";
  const userRole = user?.publicMetadata?.role || "admin";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity md:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-40 flex h-full flex-col border-r border-border bg-surface transition-all duration-200 md:static",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <Link href="/admin" className={cn("font-heading text-lg font-semibold", isCollapsed && "sr-only")}
            aria-label="Servitude Logic dashboard"
          >
            {appInfo.name || "Servitude Logic"}
          </Link>
          <button
            type="button"
            onClick={isCollapsed ? toggleSidebar : openMobileMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-hover md:hidden"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-hover md:inline-flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FiMenu className="h-5 w-5" /> : <FiX className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigationItems.map((section) => (
            <div key={section.section} className="mb-6">
              <p
                className={cn(
                  "px-3 text-xs font-semibold uppercase tracking-wide text-muted",
                  isCollapsed && "sr-only",
                )}
              >
                {section.section}
              </p>
              <ul className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                          "hover:bg-surface-hover hover:text-foreground",
                          isActive
                            ? "bg-accent-soft text-primary"
                            : "text-muted",
                          isCollapsed && "justify-center gap-0 px-2",
                        )}
                        onClick={closeMobileMenu}
                      >
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                        <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-0">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openMobileMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-hover md:hidden"
                aria-label="Open menu"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm text-muted">Welcome back</p>
                <p className="text-base font-semibold text-foreground">
                  {isLoaded ? userName : "Loading user"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-hover"
                aria-label="View notifications"
              >
                <FiBell className="h-5 w-5" />
                <span className="absolute right-2 top-2 inline-flex h-2 w-2 items-center justify-center rounded-full bg-primary" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-hover"
                aria-label="Toggle theme"
              >
                {themeIcon}
              </button>

              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface-hover"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface">
                    {initials}
                  </span>
                  <span className="hidden text-left md:flex md:flex-col">
                    <span className="text-sm font-medium text-foreground">{userName}</span>
                    <span className="text-xs uppercase text-muted">{userRole}</span>
                  </span>
                  <FiChevronDown className="hidden h-4 w-4 text-muted md:block" aria-hidden="true" />
                </button>

                <div
                  className={cn(
                    "absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-lg",
                    "origin-top-right transition-all duration-150",
                    isUserMenuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
                  )}
                  role="menu"
                >
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{userName}</p>
                    <p className="text-xs uppercase text-muted">{userRole}</p>
                  </div>
                  <div className="flex flex-col p-2">
                    <Link
                      href="/admin/settings"
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings className="h-4 w-4" aria-hidden="true" />
                      Account settings
                    </Link>
                    <SignOutButton redirectUrl="/">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiLogOut className="h-4 w-4" aria-hidden="true" />
                        Sign out
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-background px-4 pb-12 pt-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
