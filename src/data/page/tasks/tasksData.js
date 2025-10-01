// src/data/page/tasks/tasksData.js
/**
 * Task board status column configuration.
 *
 * Provides the ordered list of task-status columns used by the Tasks page,
 * including a machine ID, display title, and icon component for each status.
 *
 * @typedef {Object} StatusColumn
 * @property {('BACKLOG'|'IN_PROGRESS'|'BLOCKED'|'READY_FOR_REVIEW'|'CLIENT_APPROVED'|'DONE')} id - Unique status identifier.
 * @property {string} title - Human-readable column title.
 * @property {Function} icon - React icon component rendered for the status.
 */
import {
  FiCheckSquare,
  FiPlayCircle,
  FiSquare,
  FiTarget,
  FiAlertCircle,
  FiPauseCircle,
  FiFlag,
} from "react-icons/fi";

/**
 * Ordered status columns for the task board UI.
 * @type {StatusColumn[]}
 */
export const statusColumns = [
  { id: "BACKLOG", title: "Backlog", icon: FiSquare },
  { id: "IN_PROGRESS", title: "In Progress", icon: FiPlayCircle },
  { id: "BLOCKED", title: "Blocked", icon: FiAlertCircle },
  { id: "READY_FOR_REVIEW", title: "Ready for review", icon: FiFlag },
  { id: "CLIENT_APPROVED", title: "Client approved", icon: FiTarget },
  { id: "DONE", title: "Done", icon: FiCheckSquare },
];

export const getStatusVariant = {
  DONE: "success",
  CLIENT_APPROVED: "success",
  READY_FOR_REVIEW: "info",
  IN_PROGRESS: "warning",
  BLOCKED: "error",
  BACKLOG: "secondary",
};

export const getPriorityVariant = {
  HIGH: "destructive",
  MEDIUM: "warning",
  LOW: "secondary",
};

export const statsData = [
  {
    label: "Total Tasks",
    value: (stats) => stats?.total?.toString() || "0",
    change: "+12 this week",
    isPositive: true,
    icon: FiCheckSquare,
    color: "#3b82f6",
  },
  {
    label: "In Progress",
    value: (stats) => stats?.inProgress?.toString() || "0",
    change: "+5 today",
    isPositive: true,
    icon: FiPlayCircle,
    color: "#f59e0b",
  },
  {
    label: "Ready for review",
    value: (stats) => stats?.readyForReview?.toString() || "0",
    change: (stats) => stats?.readyForReviewChange || "",
    isPositive: false,
    icon: FiFlag,
    color: "#6366f1",
  },
  {
    label: "Blocked",
    value: (stats) => stats?.blocked?.toString() || "0",
    change: (stats) => stats?.blockedChange || "",
    isPositive: false,
    icon: FiAlertCircle,
    color: "#ef4444",
  },
];

export const statusOption = [
  { label: "All Status", value: "all" },
  { label: "Backlog", value: "BACKLOG" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Ready for review", value: "READY_FOR_REVIEW" },
  { label: "Client approved", value: "CLIENT_APPROVED" },
  { label: "Done", value: "DONE" },
];

export const priorityOption = [
  { label: "All Priority", value: "all" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];
