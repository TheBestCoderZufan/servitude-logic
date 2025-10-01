// src/data/navigation/publicNavigationData.js
/**
 * @typedef {Object} NavLink
 * @property {string} href - Link target path.
 * @property {string} label - Visible link label.
 */
/**
 * Primary navigation links for the site header.
 *
 * Consumed by `src/components/Navigation/Navigation.jsx` to render top‑level nav items.
 * @type {NavLink[]}
 */
export const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/workflow", label: "Workflow" },
  { href: "/stories", label: "Stories" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];
/**
 * Secondary navigation links shown in the header dropdown (“Get Started”).
 *
 * Used in `src/components/Navigation/Navigation.jsx` within the dropdown menu for guests.
 * @type {NavLink[]}
 */
export const unauthenticatedDropdownLinks = [
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
];

/**
 * Primary portal destinations available to authenticated visitors, grouped by role class.
 *
 * The STAFF bucket covers ADMIN, PROJECT_MANAGER, and DEVELOPER roles, while CLIENT denotes the
 * client portal. The objects drive the additional navigation links rendered once a session exists.
 * @type {Record<"CLIENT"|"STAFF", NavLink>}
 */
export const portalReturnTargets = {
  CLIENT: { href: "/dashboard", label: "Dashboard" },
  STAFF: { href: "/admin", label: "Console" },
};

/**
 * @typedef {Object} AuthMenuItem
 * @property {"link"|"signOut"} type - Menu entry type.
 * @property {string} label - Visible label for the menu entry.
 * @property {string} [href] - Destination when `type` is "link".
 * @property {string} [redirectUrl] - Redirect target for sign out actions.
 */

/**
 * Authenticated dropdown links shown in the header when a user is signed in.
 *
 * Clients and staff both receive access to settings and sign-out controls via the dropdown.
 * @type {Record<"CLIENT"|"STAFF", AuthMenuItem[]>}
 */
export const authenticatedDropdownLinks = {
  CLIENT: [
    { type: "link", href: "/dashboard/settings", label: "Settings" },
    { type: "signOut", label: "Sign Out", redirectUrl: "/" },
  ],
  STAFF: [
    { type: "link", href: "/admin/settings", label: "Settings" },
    { type: "signOut", label: "Sign Out", redirectUrl: "/" },
  ],
};
