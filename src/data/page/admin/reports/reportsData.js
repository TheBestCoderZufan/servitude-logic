// src/data/page/admin/reports/reportsData.js
/**
 * Admin Reports page option data.
 *
 * Defines select option lists used to filter analytics and activity on the
 * admin reports view (date range, project scope, and team segment).
 *
 * @typedef {Object} SelectOption
 * @property {string} value - Machine-friendly value submitted in filters.
 * @property {string} label - Human-readable label rendered in the UI.
 */

/**
 * Available date range presets for reporting.
 * @type {SelectOption[]}
 */
export const dateRangeOptions = [
  { value: "last-7-days", label: "Last 7 days" },
  { value: "last-30-days", label: "Last 30 days" },
  { value: "last-90-days", label: "Last 90 days" },
  { value: "this-year", label: "This year" },
  { value: "last-year", label: "Last year" },
];

/**
 * Project scope filters determining which projects are included.
 * @type {SelectOption[]}
 */
export const projectFilterOptions = [
  { value: "all", label: "All Projects" },
  { value: "active", label: "Active Only" },
  { value: "completed", label: "Completed Only" },
];

/**
 * Team segment filters used to slice report metrics.
 * @type {SelectOption[]}
 */
export const teamFilterOptions = [
  { value: "all", label: "All Team Members" },
  { value: "developers", label: "Developers" },
  { value: "designers", label: "Designers" },
  { value: "managers", label: "Managers" },
];
