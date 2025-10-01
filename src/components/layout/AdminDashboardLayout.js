// src/components/layout/AdminDashboardLayout.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  FiSettings,
  FiMenu,
  FiX,
  FiBell,
  FiMoon,
  FiSun,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import {
  LayoutContainer,
  Sidebar,
  SidebarHeader,
  Logo,
  Navigation,
  NavSectionTitle,
  NavItem,
  CollapseButton,
  MainContent,
  TopBar,
  MobileMenuButton,
  TopBarActions,
  NotificationButton,
  UserMenu,
  UserButton,
  Avatar,
  UserInfo,
  UserName,
  UserRole,
  ContentArea,
  MobileOverlay,
  UserDropdown,
  DropdownItem,
  NavSection,
} from "./AdminDashboardLayout.style";
import appInfo from "@/data/appInfo.js";
import { navigationItems } from "@/data/navigation/adminNavigation.data";
import { getInitials } from "@/lib/utils";

/**
 * AdminDashboardLayout
 *
 * Shell layout for the admin portal. Renders the collapsible sidebar,
 * top bar with user menu, and a content area for nested pages.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Page content.
 * @param {string} [props.activeTab="dashboard"] - Active nav tab id.
 * @returns {JSX.Element}
 */
export default function AdminDashboardLayout({
  children,
  activeTab = "dashboard",
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); //
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); //
  const [isDark, setIsDark] = useState(false);
  const { user, isLoaded } = useUser(); //

  // Add this state and effect to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("adminSidebarCollapsed");
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch (_) {
      // noop
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("adminSidebarCollapsed", String(next));
      } catch (_) {}
      return next;
    });
  }; //

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  }; //

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  }; //

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  }; //

  // Sync dark mode toggle with global theme mode
  useEffect(() => {
    const mode =
      typeof document !== "undefined"
        ? document.documentElement.getAttribute("data-mode")
        : "light";
    setIsDark(mode === "dark");
    const onMode = () => {
      const m = document.documentElement.getAttribute("data-mode") || "light";
      setIsDark(m === "dark");
    };
    window.addEventListener("theme-mode", onMode);
    return () => window.removeEventListener("theme-mode", onMode);
  }, []);

  return (
    <LayoutContainer>
      <MobileOverlay $ismobileopen={isMobileOpen} onClick={closeMobileMenu} />

      <Sidebar $iscollapsed={isCollapsed} $ismobileopen={isMobileOpen}>
        {/* Sidebar content remains the same */}
        <SidebarHeader>
          <Logo $iscollapsed={isCollapsed}>{appInfo.name}</Logo>
          <CollapseButton onClick={toggleSidebar}>
            {isCollapsed ? <FiMenu /> : <FiX />}
          </CollapseButton>
        </SidebarHeader>

        <Navigation>
          {navigationItems.map((section) => (
            <NavSection key={section.section}>
              <NavSectionTitle $iscollapsed={isCollapsed}>
                {section.section}
              </NavSectionTitle>
              {section.items.map((item) => (
                <NavItem
                  key={item.id}
                  href={item.href}
                  $isActive={activeTab === item.id}
                  $iscollapsed={isCollapsed}
                  onClick={closeMobileMenu}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </NavItem>
              ))}
            </NavSection>
          ))}
        </Navigation>
      </Sidebar>

      <MainContent>
        <TopBar>
          <MobileMenuButton onClick={toggleMobileMenu}>
            <FiMenu />
          </MobileMenuButton>

          <TopBarActions>
            {/* Light/Dark mode toggle (UI only for now) */}
            <NotificationButton
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              aria-pressed={isDark}
              onClick={() => {
                const next = isDark ? "light" : "dark";
                if (
                  typeof window !== "undefined" &&
                  typeof window.__setThemePreference === "function"
                ) {
                  window.__setThemePreference(next);
                }
              }}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <FiSun /> : <FiMoon />}
            </NotificationButton>
            <NotificationButton>
              <FiBell />
              {/* <NotificationBadge>3</NotificationBadge> */}
            </NotificationButton>

            <UserMenu>
              <UserButton onClick={toggleUserMenu}>
                <Avatar>
                  {/* Hydration-safe initials */}
                  {isClient && isLoaded ? getInitials(user?.fullName) : ""}
                </Avatar>
                <UserInfo>
                  {/* Hydration-safe user name and role */}
                  <UserName>
                    {isClient && isLoaded && user ? user.fullName : "..."}
                  </UserName>
                  <UserRole>
                    {isClient && isLoaded && user
                      ? user.publicMetadata?.role || "Developer"
                      : "..."}
                  </UserRole>
                </UserInfo>
                <FiChevronDown />
              </UserButton>

              {/* Use your UserDropdown and DropdownItem components */}
              <UserDropdown $isopen={isUserMenuOpen}>
                <DropdownItem
                  as={Link}
                  href="/admin/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FiSettings />
                  Settings
                </DropdownItem>
                <SignOutButton>
                  <DropdownItem>
                    <FiLogOut />
                    Sign Out
                  </DropdownItem>
                </SignOutButton>
              </UserDropdown>
            </UserMenu>
          </TopBarActions>
        </TopBar>
        <ContentArea>{children}</ContentArea>
      </MainContent>
    </LayoutContainer>
  );
}
