// src/components/layout/ClientDashboardLayout.js
"use client";
import { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import appInfo from "@/data/appInfo.js";
import { Button, Avatar } from "@/components/ui";
import Link from "next/link";
import {
  LayoutContainer,
  TopBar,
  Brand,
  UserArea,
  ContentArea,
  NavBar,
  SubNavBar,
  NavLinkButton,
  UserMenu,
  UserButton,
  UserName,
  UserDropdown,
  DropdownItem,
} from "./ClientDashboardLayout.style";
import ProjectSelector from "@/components/ProjectSelector/ProjectSelector";
import { navItems } from "@/data/navigation/clientNavigationData";

/**
 * The top-level layout component for the client dashboard.
 *
 * This component is only used server-side and is not intended to be used
 * client-side.
 *
 * @param {object} props The props object.
 * @param {React.ReactElement} props.children The children elements.
 * @returns {React.ReactElement} The rendered JSX.
 */
export default function ClientDashboardLayout({ children }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [initials, setInitials] = useState("");

  useEffect(() => {
    if (user?.fullName) {
      const val = user.fullName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      setInitials(val);
    }
  }, [user?.fullName]);

  // Navigation links replaced with project selector per new spec

  return (
    <LayoutContainer>
      <TopBar>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Brand
            role="link"
            tabIndex={0}
            aria-label="Go to dashboard"
            onClick={() => router.push("/dashboard")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push("/dashboard");
              }
            }}
          >
            {appInfo.name}
          </Brand>
          <NavBar>
            <ProjectSelector />
          </NavBar>
        </div>
        <UserArea>
          <UserMenu>
            <UserButton aria-haspopup="menu" aria-expanded="false">
              <Avatar size="32">{isLoaded ? initials : ""}</Avatar>
              <UserName>{isLoaded && user ? user.fullName : ""}</UserName>
            </UserButton>
            <UserDropdown role="menu" aria-label="User menu">
              <DropdownItem as={Link} href="/dashboard/settings" role="menuitem">
                Settings
              </DropdownItem>
              <SignOutButton>
                <DropdownItem role="menuitem">Sign Out</DropdownItem>
              </SignOutButton>
            </UserDropdown>
          </UserMenu>
        </UserArea>
      </TopBar>
      {(() => {
        const isActive = (itemHref, exact = false) => {
          if (!pathname) return false;
          return exact ? pathname === itemHref : pathname.startsWith(itemHref);
        };
        return (
          <SubNavBar>
            {navItems.map((item) => (
              <NavLinkButton
                key={item.href}
                $active={isActive(item.href, !!item.exact)}
                onClick={() => router.push(item.href)}
              >
                {item.label}
              </NavLinkButton>
            ))}
          </SubNavBar>
        );
      })()}
      <ContentArea>{children}</ContentArea>
    </LayoutContainer>
  );
}
/** @module components/layout/ClientDashboardLayout */
