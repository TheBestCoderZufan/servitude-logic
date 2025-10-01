// src/data/page/admin/clientDetailTabs.js
/**
 * @typedef {Object} ClientDetailTab
 * @property {string} id - Tab id (overview|files|messages|schedule|invoices).
 * @property {string} label - Visible tab label.
 */
/**
 * Tab configuration for the Admin Client Detail view.
 *
 * Used by `src/app/admin/clients/[id]/page.js` to render the tab strip.
 * @type {ClientDetailTab[]}
 */
export const clientDetailTabs = [
  { id: "overview", label: "Overview" },
  { id: "files", label: "Documents" },
  { id: "messages", label: "Messages & Support" },
  { id: "schedule", label: "Schedule" },
  { id: "invoices", label: "Invoices" },
];
