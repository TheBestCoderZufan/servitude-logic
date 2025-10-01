// src/components/Navigation/NavigationClient.jsx
import Link from "next/link";
import { Button } from "@/components/ui";
import {
  Header,
  Logo,
  LogoLink,
  NavLinks,
  NavLink,
  AuthButtons,
  DropdownContainer,
  DropdownMenu,
  DropdownItem,
  NavActionButton,
  DropdownButtonItem,
} from "./Navigation.style";
import { AuthSignOutButton } from "@/lib/auth/client";
import { capitalizeFirstLetter } from "@/lib/utils";

/**
 * @typedef {Object} AuthMenuItem
 * @property {"link"|"signOut"} type - Menu entry type.
 * @property {string} label - Visible label.
 * @property {string} [href] - Target path for link entries.
 * @property {string} [redirectUrl] - Redirect path after sign out.
 */

/**
 * NavigationClient
 * Client presentation component for the public navigation header.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.appName - Application display name for the logo.
 * @param {Array<{href: string, label: string}>} props.navLinks - Static marketing navigation links.
 * @param {AuthMenuItem[]} props.menuItems - Dropdown entries rendered for the primary action.
 * @param {{href: string, label: string}|null} props.primaryAction - Authenticated call-to-action button configuration.
 * @param {string|null|undefined} [props.userRole] - Normalized role label used to prefix the action button text.
 * @returns {JSX.Element} Rendered navigation bar.
 */
export default function NavigationClient({
  appName,
  navLinks,
  menuItems,
  primaryAction,
  userRole,
}) {
  const safeNavLinks = Array.isArray(navLinks) ? navLinks : [];
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const buttonLabel = primaryAction?.label ?? "Get Started";
  const menuAriaLabel = `${buttonLabel} menu`;
  const showDropdown = safeMenuItems.length > 0;

  return (
    <Header>
      <Logo>
        <LogoLink href="/">{appName}</LogoLink>
      </Logo>
      <NavLinks>
        {safeNavLinks.map((item) => (
          <NavLink key={item.href} href={item.href}>
            {item.label}
          </NavLink>
        ))}
      </NavLinks>
      <AuthButtons>
        {showDropdown ? (
          <DropdownContainer>
            <Button aria-haspopup="menu" aria-expanded="false">
              {userRole
                ? `${capitalizeFirstLetter(userRole)} ${buttonLabel}`
                : buttonLabel}
            </Button>
            <DropdownMenu role="menu" aria-label={menuAriaLabel}>
              {safeMenuItems.map((item) => {
                if (item.type === "signOut") {
                  return (
                    <AuthSignOutButton
                      key={item.label}
                      redirectUrl={item.redirectUrl || "/"}
                    >
                      <DropdownButtonItem type="button" role="menuitem">
                        {item.label}
                      </DropdownButtonItem>
                    </AuthSignOutButton>
                  );
                }

                return (
                  <DropdownItem
                    key={item.href}
                    role="menuitem"
                    href={item.href}
                  >
                    {item.label}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </DropdownContainer>
        ) : (
          primaryAction && (
            <NavActionButton as={Link} href={primaryAction.href}>
              {primaryAction.label}
            </NavActionButton>
          )
        )}
      </AuthButtons>
    </Header>
  );
}

/** @module components/Navigation/NavigationClient */
