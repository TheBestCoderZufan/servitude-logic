// src/components/Navigation/Navigation.jsx
import NavigationClient from "./NavigationClient";
import appInfo from "@/data/appInfo";
import {
  navLinks,
  unauthenticatedDropdownLinks,
  authenticatedDropdownLinks,
  portalReturnTargets,
} from "@/data/navigation/publicNavigationData";
import { auth } from "@clerk/nextjs/server";
import { getUserRole, isStaffRole } from "@/lib/api-helpers";
/**
 * Navigation
 * Server component that resolves authentication context, derives role-aware navigation
 * controls, and renders the public navigation header.
 *
 * @returns {Promise<JSX.Element>} Promise resolving to the navigation header element.
 */
export default async function Navigation() {
  const { userId } = await auth();
  const isAuthenticated = Boolean(userId);
  let menuItems = unauthenticatedDropdownLinks;
  let primaryAction = null;
  let userRole = null;

  if (isAuthenticated) {
    const role = await getUserRole(userId);
    const staff = isStaffRole(role);
    const roleKey = staff ? "STAFF" : "CLIENT";
    primaryAction = portalReturnTargets[roleKey];
    menuItems = authenticatedDropdownLinks[roleKey];
    userRole = role !== "CLIENT" ? role : null;
  }

  return (
    <NavigationClient
      appName={appInfo.name}
      navLinks={navLinks}
      menuItems={menuItems}
      primaryAction={primaryAction}
      userRole={userRole}
    />
  );
}

/** @module components/Navigation/Navigation */
