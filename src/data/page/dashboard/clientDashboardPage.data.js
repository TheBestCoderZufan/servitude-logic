// src/data/page/dashboard/clientDashboardPage.data.js

/**
 * @typedef {Object} ClientDashboardQuickAction
 * @property {string} id - Stable identifier for the action.
 * @property {string} label - Button label presented to the client.
 * @property {string} description - Helper copy clarifying the action.
 * @property {string} href - Navigation target for the action.
 * @property {string} icon - Icon component identifier rendered alongside the label.
 */

/**
 * Quick navigation shortcuts displayed on the client dashboard.
 *
 * @type {ClientDashboardQuickAction[]}
 */
export const clientDashboardQuickActions = [
  {
    id: "projects",
    label: "Review Projects",
    description: "Check timelines &amp; progress for every engagement.",
    href: "/dashboard/projects",
    icon: "FiFolder",
  },
  {
    id: "invoices",
    label: "View Invoices",
    description: "Download receipts &amp; confirm upcoming payments.",
    href: "/dashboard/invoices",
    icon: "FiDollarSign",
  },
  {
    id: "support",
    label: "Messages &amp; Support",
    description: "Reach out to the team or follow up on requests.",
    href: "/dashboard/messages",
    icon: "FiMessageSquare",
  },
];

/** @module data/page/dashboard/clientDashboardPage */
