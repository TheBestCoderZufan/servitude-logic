// src/data/navigation/clientNavigationData.js
/**
 * Client dashboard navigation configuration.
 *
 * Defines the list of navigation items shown in the client dashboard UI,
 * including each item's path, display label, and whether it should match the
 * route exactly when determining active state.
 *
 * @typedef {Object} ClientNavItem
 * @property {string} href - Route path for the navigation target (absolute, app-relative URL).
 * @property {string} label - Human-readable label displayed in the navigation.
 * @property {boolean} exact - When true, marks the item active only on exact path match.
 */
/**
 * Ordered list of client navigation entries.
 * @type {ClientNavItem[]}
 */
export const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/projects", label: "Projects", exact: false },
  { href: "/dashboard/proposals", label: "Proposals", exact: false },
  { href: "/dashboard/approvals", label: "Approvals", exact: false },
  { href: "/dashboard/files", label: "Documents", exact: false },
  { href: "/dashboard/invoices", label: "View Invoices", exact: false },
  { href: "/dashboard/messages", label: "Messages & Support", exact: false },
];
