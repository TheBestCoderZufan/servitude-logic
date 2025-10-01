// src/data/page/admin/adminData.js
import {
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiTarget,
  FiInfo,
  FiFileText,
  FiSettings,
  FiHome,
  FiUser,
  FiInbox,
} from "react-icons/fi";

import { FiClock, FiCheckCircle } from "react-icons/fi";
import { formatCurrency } from "@/lib/utils";

/**
 * @typedef {Object} AdminQuickAction
 * @property {string} title - Action title.
 * @property {string} description - Short explanation of the action.
 * @property {Function} icon - React icon component.
 * @property {string} color - Accent color for the action card.
 * @property {string} href - Destination route.
 */
/**
 * Quick action shortcuts displayed on the Admin dashboard.
 *
 * Used in `src/app/admin/page.js` to render action cards.
 * @type {AdminQuickAction[]}
 */
export const quickActions = [
  {
    title: "Review Intakes",
    description: "Triage new client submissions",
    icon: FiInbox,
    color: "#6366f1",
    href: "/admin/intake",
  },
  {
    title: "New Project",
    description: "Start a new project for a client",
    icon: FiFolder,
    color: "#3b82f6",
    href: "/projects/new",
  },
  {
    title: "Add Client",
    description: "Register a new client",
    icon: FiUsers,
    color: "#10b981",
    href: "/admin/clients/new",
  },
  {
    title: "Create Task",
    description: "Add a new task to a project",
    icon: FiCheckSquare,
    color: "#f59e0b",
    href: "/tasks/new",
  },
  {
    title: "Generate Invoice",
    description: "Create an invoice for a client",
    icon: FiDollarSign,
    color: "#ef4444",
    href: "/invoices/new",
  },
];

/**
 * Maps project status enum to UI badge variant keys.
 *
 * Used by Admin views (e.g., `src/app/admin/projects/page.js`) to style status badges.
 * @type {Object<string, string>}
 */
export const getStatusVariant = {
  PLANNING: "planning",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
  ON_HOLD: "onHold",
  CANCELLED: "cancelled",
  default: "default",
};

/**
 * Maps task priority enum to UI badge variant keys.
 *
 * Used in Admin pages (e.g., tasks and projects) for priority badges.
 * @type {Object<string, string>}
 */
export const getPriorityVariant = {
  HIGH: "error",
  MEDIUM: "warning",
  LOW: "success",
  default: "default",
};

/**
 * Maps activity types to corresponding icons used in the activity feed.
 *
 * Used in `src/app/admin/page.js` when rendering recent activity.
 * @type {Object<string, Function>}
 */
export const getActivityIcon = {
  task_completed: FiCheckSquare,
  project_updated: FiTrendingUp,
  client_message: FiActivity,
  invoice_sent: FiDollarSign,
  task_assigned: FiTarget,
  default: FiInfo,
};

/**
 * Maps activity types to theme-consistent colors for activity indicators.
 *
 * Used alongside `getActivityIcon` in the Admin dashboard activity list.
 * @type {Object<string, string>}
 */
export const getActivityColor = {
  task_completed: "#10b981",
  project_updated: "#3b82f6",
  client_message: "#f59e0b",
  invoice_sent: "#ef4444",
  task_assigned: "#8b5cf6",
  default: "#64748b",
};

/**
 * Stats configuration for Admin Projects page.
 * Each item provides label, icon, color and methods to compute display values.
 *
 * Methods receive a `stats` object (from `/api/projects/stats`) and must return:
 * - value(stats): string — the primary stat value to display
 * - change(stats): string — a short change/secondary descriptor
 * - isPositive(stats): boolean — whether the change trend is positive
 */
export const statsConfig = [
  {
    label: "Total Projects",
    value: (stats) => stats.totalProjects?.toString() || "0",
    change: (stats) => `+${stats.newProjectsThisMonth || 0} this month`,
    isPositive: (stats) => (stats.projectGrowth || 0) >= 0,
    icon: FiFolder,
    color: "#3b82f6",
  },
  {
    label: "In Progress",
    value: (stats) => stats.activeProjects?.toString() || "0",
    change: (stats) => `${stats.completionRate || 0}% completion rate`,
    isPositive: (stats) => (stats.completionRate || 0) >= 70,
    icon: FiClock,
    color: "#f59e0b",
  },
  {
    label: "Completed",
    value: (stats) => stats.projectsByStatus?.COMPLETED?.toString() || "0",
    change: (stats) => `${stats.averageProjectDuration || 0} days avg duration`,
    isPositive: () => true,
    icon: FiCheckCircle,
    color: "#10b981",
  },
  {
    label: "Total Revenue",
    value: (stats) => formatCurrency(stats.totalRevenue || 0),
    change: (stats) =>
      stats.overdueProjects
        ? `${stats.overdueProjects} overdue`
        : "All on track",
    isPositive: (stats) => (stats.overdueProjects || 0) === 0,
    icon: FiDollarSign,
    color: "#ef4444",
  },
];

/**
 * @typedef {Object} FilterOption
 * @property {string} id - Unique identifier used for keys and selection.
 * @property {string} value - Filter value applied in queries/state.
 * @property {string} label - Visible option label.
 */
/**
 * Project status filter options for the Admin Projects page.
 *
 * Used in `src/app/admin/projects/page.js` to render the Status <select>.
 * Values are lower‑case; the page uppercases non‑"all" values for API usage.
 * @type {FilterOption[]}
 */
export const statusOption = [
  { id: "all", value: "all", label: "All Status" },
  { id: "planning", value: "planning", label: "Planning" },
  { id: "in_progress", value: "in_progress", label: "In Progress" },
  { id: "completed", value: "completed", label: "Completed" },
  { id: "on_hold", value: "on_hold", label: "On Hold" },
  { id: "cancelled", value: "cancelled", label: "Cancelled" },
];

/**
 * Project priority filter options for the Admin Projects page.
 *
 * Used in `src/app/admin/projects/page.js` to render the Priority <select>.
 * Values are lower‑case; the page uppercases non‑"all" values for API usage.
 * @type {FilterOption[]}
 */
export const priorityOption = [
  { id: "all", value: "all", label: "All Priority" },
  { id: "high", value: "high", label: "High Priority" },
  { id: "medium", value: "medium", label: "Medium Priority" },
  { id: "low", value: "low", label: "Low Priority" },
];
