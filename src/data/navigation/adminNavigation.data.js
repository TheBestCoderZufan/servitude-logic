// src/data/navigation/adminNavigation.data.js
import {
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiDollarSign,
  FiFileText,
  FiSettings,
  FiHome,
  FiUser,
  FiInbox,
} from "react-icons/fi";

/**
 * @typedef {Object} AdminNavItem
 * @property {Function} icon - React icon component used for the nav item.
 * @property {string} label - Visible label.
 * @property {string} href - Destination route.
 * @property {string} id - Unique id used to match active route.
 */
/**
 * @typedef {Object} AdminNavSection
 * @property {string} section - Section title.
 * @property {AdminNavItem[]} items - Items belonging to the section.
 */
/**
 * Admin sidebar navigation sections and items.
 *
 * Consumed by `src/components/layout/AdminDashboardLayout.js` to build the sidebar.
 * @type {AdminNavSection[]}
 */
export const navigationItems = [
  {
    section: "Overview",
    items: [{ icon: FiHome, label: "Dashboard", href: "/admin", id: "admin" }],
  },
  {
    section: "Management",
    items: [
      {
        icon: FiUsers,
        label: "Clients",
        href: "/admin/clients",
        id: "clients",
      },
      {
        icon: FiUser,
        label: "Users",
        href: "/admin/users",
        id: "users",
      },
      {
        icon: FiFolder,
        label: "Projects",
        href: "/admin/projects",
        id: "projects",
      },
      {
        icon: FiInbox,
        label: "Intake Queue",
        href: "/admin/intake",
        id: "intake",
      },
      {
        icon: FiCheckSquare,
        label: "Tasks",
        href: "/admin/tasks",
        id: "tasks",
      },
    ],
  },
  {
    section: "Financial",
    items: [
      {
        icon: FiDollarSign,
        label: "Invoices",
        href: "/admin/invoices",
        id: "invoices",
      },
      {
        icon: FiFileText,
        label: "Reports",
        href: "/admin/reports",
        id: "reports",
      },
    ],
  },
];
