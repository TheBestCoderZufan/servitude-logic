// src/app/admin/tasks/TasksPageClient.jsx
/** @module admin/tasks/TasksPageClient */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/shadcn/Button";
import { useBlockClientRole } from "@/lib/roleGuard";
import { useToastNotifications } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiColumns,
  FiPlus,
  FiEye,
  FiEdit,
  FiMoreVertical,
  FiClock,
  FiMessageSquare,
} from "react-icons/fi";
import { statusColumns, statsData, statusOption, priorityOption } from "@/data/page/tasks/tasksData";

const STATUS_CLASSES = {
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  CLIENT_APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  READY_FOR_REVIEW: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
  BACKLOG: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
};

const PRIORITY_CLASSES = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
};

function StatusBadge({ status }) {
  const variant = STATUS_CLASSES[status] || STATUS_CLASSES.default;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize", variant)}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const variant = PRIORITY_CLASSES[priority] || PRIORITY_CLASSES.default;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize", variant)}>
      {priority.toLowerCase()}
    </span>
  );
}

function AvatarInitials({ name }) {
  const initials = (name || "U")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials}
    </span>
  );
}

function IconButton({ children, className, ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-surface-hover hover:text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function formatDueDate(dueDateString) {
  if (!dueDateString) return null;
  const dueDate = new Date(dueDateString);
  const today = new Date();
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `${diffDays} days`;
  return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isTaskOverdue(dueDateString) {
  if (!dueDateString) return false;
  return new Date(dueDateString) < new Date();
}

function isTaskDueToday(dueDateString) {
  if (!dueDateString) return false;
  return new Date(dueDateString).toDateString() === new Date().toDateString();
}

/**
 * Tasks page client island.
 *
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.initialTasks - Initial tasks list.
 * @param {Object} props.initialStats - Initial stats object { total, inProgress, completed, overdue }.
 * @param {string} [props.initialSearch=""] - Initial search term.
 * @param {string} [props.initialStatus="all"] - Initial status filter.
 * @param {string} [props.initialPriority="all"] - Initial priority filter.
 * @param {string} [props.initialProject="all"] - Initial project filter (name).
 * @param {string} [props.initialAssignee="all"] - Initial assignee filter (name).
 * @returns {JSX.Element}
 */
export default function TasksPageClient({
  initialTasks,
  initialStats,
  initialSearch = "",
  initialStatus = "all",
  initialPriority = "all",
  initialProject = "all",
  initialAssignee = "all",
}) {
  useBlockClientRole();
  const { notifyError } = useToastNotifications();

  const [tasks, setTasks] = useState(initialTasks || []);
  const [filteredTasks, setFilteredTasks] = useState(initialTasks || []);
  const [stats, setStats] = useState(initialStats || { total: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [projectFilter, setProjectFilter] = useState(initialProject);
  const [assigneeFilter, setAssigneeFilter] = useState(initialAssignee);
  const [viewMode, setViewMode] = useState("grid");
  const [skipInitialFetch, setSkipInitialFetch] = useState(true);

  useEffect(() => {
    setSkipInitialFetch(false);
  }, []);

  const uniqueProjects = useMemo(
    () => [...new Set(tasks.map((t) => t.project?.name).filter(Boolean))],
    [tasks],
  );
  const uniqueAssignees = useMemo(
    () => [...new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))],
    [tasks],
  );

  useEffect(() => {
    let filtered = tasks;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.project?.name.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "all") filtered = filtered.filter((t) => t.priority === priorityFilter);
    if (projectFilter !== "all") filtered = filtered.filter((t) => t.project?.name === projectFilter);
    if (assigneeFilter !== "all") filtered = filtered.filter((t) => t.assignee?.name === assigneeFilter);
    setFilteredTasks(filtered);
  }, [searchTerm, statusFilter, priorityFilter, projectFilter, assigneeFilter, tasks]);

  async function apiFetchTasks(filters = {}) {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.projectId && filters.projectId !== "all") params.set("projectId", filters.projectId);
    if (filters.assigneeId && filters.assigneeId !== "all") params.set("assigneeId", filters.assigneeId);
    const res = await fetch(`/api/tasks?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  }

  async function apiFetchStats() {
    const res = await fetch(`/api/tasks/stats`);
    if (!res.ok) throw new Error("Failed to fetch task stats");
    return res.json();
  }

  useEffect(() => {
    if (skipInitialFetch) return;
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetchTasks({
          search: searchTerm,
          status: statusFilter,
          priority: priorityFilter,
          projectId: projectFilter,
          assigneeId: assigneeFilter,
        });
        setTasks(data.tasks || []);
      } catch (error) {
        notifyError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, [assigneeFilter, priorityFilter, projectFilter, searchTerm, statusFilter, notifyError, skipInitialFetch]);

  useEffect(() => {
    if (skipInitialFetch) return;
    if (initialStats) return;
    (async () => {
      try {
        const s = await apiFetchStats();
        setStats({
          total: s.totalTasks ?? 0,
          inProgress: s.tasksByStatus?.IN_PROGRESS ?? 0,
          completed: s.tasksByStatus?.DONE ?? 0,
          overdue: s.overdueTasks ?? 0,
        });
      } catch (error) {
        // Surface stats errors silently
      }
    })();
  }, [initialStats, skipInitialFetch]);

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
  }

  function renderTaskCard(task, isKanban = false) {
    const overdue = isTaskOverdue(task.dueDate);
    const dueToday = isTaskDueToday(task.dueDate);
    const containerClasses = isKanban
      ? "rounded-xl border border-border bg-background p-4 shadow-sm"
      : "flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm";

    return (
      <div key={task.id} className={containerClasses}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold text-foreground">{task.title}</p>
              {task.description ? (
                <p className="line-clamp-2 text-sm text-muted">{task.description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.project ? (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {task.project.name}
                </span>
              ) : null}
              {task.dueDate ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold",
                    overdue
                      ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200"
                      : dueToday
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
                  )}
                >
                  <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDueDate(task.dueDate)}
                </span>
              ) : null}
            </div>
          </div>

          {task.assignee ? (
            <div className="flex items-center gap-3">
              <AvatarInitials name={task.assignee.name || task.assignee.email} />
              <span className="text-sm text-muted">{task.assignee.name}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted">
          <div className="flex items-center gap-3">
            {task._count?.comments > 0 ? (
              <span className="inline-flex items-center gap-1">
                <FiMessageSquare className="h-4 w-4" aria-hidden="true" />
                {task._count.comments}
              </span>
            ) : null}
            {task._count?.timeLogs > 0 ? (
              <span className="inline-flex items-center gap-1">
                <FiClock className="h-4 w-4" aria-hidden="true" />
                {task._count.timeLogs}h
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <IconButton aria-label="View task">
              <FiEye className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton aria-label="Edit task">
              <FiEdit className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            {!isKanban ? (
              <IconButton aria-label="More actions">
                <FiMoreVertical className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  function renderTableRow(task) {
    const overdue = isTaskOverdue(task.dueDate);
    const dueToday = isTaskDueToday(task.dueDate);
    return (
      <div
        key={task.id}
        className="grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm md:grid-cols-[1.5fr,1fr,1fr,auto] md:items-center"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">{task.title}</p>
          {task.project ? <p className="text-xs text-muted">{task.project.name}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {task.assignee ? <span>{task.assignee.name}</span> : <span>Unassigned</span>}
          {task.dueDate ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                overdue
                  ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200"
                  : dueToday
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
              )}
            >
              <FiClock className="h-3 w-3" aria-hidden="true" />
              {formatDueDate(task.dueDate)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-2">
          <IconButton aria-label="View task">
            <FiEye className="h-4 w-4" aria-hidden="true" />
          </IconButton>
          <IconButton aria-label="Edit task">
            <FiEdit className="h-4 w-4" aria-hidden="true" />
          </IconButton>
          <IconButton aria-label="More actions">
            <FiMoreVertical className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    );
  }

  const containerClass =
    viewMode === "kanban"
      ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      : viewMode === "grid"
      ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      : "flex flex-col gap-4";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
          <p className="text-sm text-muted">Plan, track, and collaborate across your work.</p>
        </div>
        <Button variant="secondary" className="gap-2">
          <FiPlus className="h-4 w-4" aria-hidden="true" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsData.map((card) => (
          <div key={card.label} className="flex h-full items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div>
              <p className="text-2xl font-semibold text-foreground">{card.value(stats)}</p>
              <p className="mt-1 text-sm text-muted">{card.label}</p>
              <p className={cn("mt-3 text-xs font-semibold", card.isPositive ? "text-emerald-500" : "text-red-500")}> 
                {typeof card.change === "function" ? card.change(stats) : card.change}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: card.color }}>
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {statusOption.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {priorityOption.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
            <select
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Assignees</option>
              {uniqueAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                  viewMode === "grid"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary text-primary hover:bg-primary/10",
                )}
              >
                <FiGrid className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                  viewMode === "table"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary text-primary hover:bg-primary/10",
                )}
              >
                <FiList className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                  viewMode === "kanban"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary text-primary hover:bg-primary/10",
                )}
              >
                <FiColumns className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-10 text-sm text-muted">
          <FiClock className="h-5 w-5 animate-spin" aria-hidden="true" />
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 text-center text-sm text-muted">
          <FiList className="h-10 w-10" aria-hidden="true" />
          <p className="mt-4 text-base font-semibold text-foreground">No tasks found</p>
          <p className="mt-1 text-sm text-muted">Adjust your filters or create a new task to get started.</p>
          <Button className="mt-4 gap-2">
            <FiPlus className="h-4 w-4" aria-hidden="true" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className={containerClass}>
          {viewMode === "kanban"
            ? statusColumns.map((column) => {
                const columnTasks = filteredTasks.filter((task) => task.status === column.id);
                return (
                  <div key={column.id} className="flex min-h-[320px] flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <column.icon className="h-4 w-4" aria-hidden="true" />
                        {column.title}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted">
                        {columnTasks.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {columnTasks.map((task) => renderTaskCard(task, true))}
                    </div>
                  </div>
                );
              })
            : viewMode === "grid"
            ? filteredTasks.map((task) => renderTaskCard(task))
            : filteredTasks.map((task) => renderTableRow(task))}
        </div>
      )}
    </div>
  );
}
