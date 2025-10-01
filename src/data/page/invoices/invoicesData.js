// src/data/page/invoices/invoicesData.js
import {
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";
import { formatCurrency } from "@/lib/utils";

/**
 * @typedef {Object} InvoiceStatsItem
 * @property {string} label - Visible stat label.
 * @property {Function} value - Function that returns the stat value string.
 * @property {Function} change - Function that returns the secondary change label.
 * @property {Function} isPositive - Function returning whether the change is positive.
 * @property {Function} icon - React icon component.
 * @property {string} color - Accent color for the stat card icon.
 */
/**
 * Invoice page statistics configuration.
 *
 * Used in `src/app/admin/invoices/page.js` to render stat cards.
 * @type {InvoiceStatsItem[]}
 */
export const statsData = [
  {
    label: "Total Revenue",
    value: (stats) => formatCurrency(stats.totalRevenue || 0),
    change: (stats) => "+18% this month",
    isPositive: (stats) => true,
    icon: FiDollarSign,
    color: "#10b981",
  },
  {
    label: "Outstanding",
    value: (stats) => formatCurrency(stats.outstanding || 0),
    change: (stats) => {
      const outstanding = stats.outstanding || 0;
      return `${outstanding > 0 ? "+" : ""}${formatCurrency(
        outstanding
      )} pending`;
    },
    isPositive: (stats) => false,
    icon: FiClock,
    color: "#f59e0b",
  },
  {
    label: "Paid Invoices",
    value: (stats) => {
      const paidInvoices = stats?.paidInvoices || 0;
      return paidInvoices.toString();
    },
    change: (stats) => `${stats.paidInvoices || 0} completed`,
    isPositive: (stats) => true,
    icon: FiCheckCircle,
    color: "#3b82f6",
  },
  {
    label: "Overdue",
    value: (stats) => (stats.overdue ? stats.overdue.toString() : "0"),
    change: (stats) => `${stats.overdue || 0} need attention`,
    isPositive: (stats) => stats.overdue === 0,
    icon: FiAlertCircle,
    color: "#ef4444",
  },
];

/**
 * Maps invoice status to UI variant for badges.
 *
 * Used across the invoices admin UI to color status chips.
 * @type {Object<string, string>}
 */
export const getStatusVariant = {
  DRAFT: "default",
  SENT: "warning",
  PAID: "success",
  OVERDUE: "error",
  default: "default",
};

/**
 * Maps invoice status enum to human‑readable text.
 *
 * Used in `src/app/admin/invoices/page.js` for accessibility and labels.
 * @type {Object<string, string>}
 */
export const getStatusText = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  default: "Default",
};

/**
 * @typedef {Object} InvoiceFilterOption
 * @property {string} id - Unique identifier used for keys and selection.
 * @property {string} value - Value applied in filter logic.
 * @property {string} label - Visible option label.
 */
/**
 * Invoice date filter options used by the invoices page filter bar.
 *
 * Used in `src/app/admin/invoices/page.js`.
 * @type {InvoiceFilterOption[]}
 */
export const timeOption = [
  { id: "all", value: "all", label: "All Time" },
  { id: "this-month", value: "this-month", label: "This Month" },
  { id: "last-month", value: "last-month", label: "Last Month" },
  { id: "this-quarter", value: "this-quarter", label: "This Quarter" },
  { id: "this-year", value: "this-year", label: "This Year" },
];

/**
 * Invoice status filter options used by the invoices page filter bar.
 *
 * Used in `src/app/admin/invoices/page.js`.
 * @type {InvoiceFilterOption[]}
 */
export const statusOption = [
  { id: "all", value: "all", label: "All Status" },
  { id: "draft", value: "draft", label: "Draft" },
  { id: "sent", value: "sent", label: "Sent" },
  { id: "paid", value: "paid", label: "Paid" },
  { id: "overdue", value: "overdue", label: "Overdue" },
];
