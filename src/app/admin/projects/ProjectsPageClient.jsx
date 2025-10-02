// src/app/admin/projects/ProjectsPageClient.jsx
/** @module admin/projects/ProjectsPageClient */
"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/shadcn/Button";
import { useToastNotifications } from "@/components/ui/Toast";
import {
  DashboardStatsSkeleton,
  ProjectCardSkeleton,
  GridLoading,
} from "@/components/ui/Loading";
import { useBlockClientRole } from "@/lib/roleGuard";
import { formatDate, getInitials } from "@/lib/utils";
import {
  getStatusVariant,
  statsConfig,
  statusOption,
  priorityOption,
} from "@/data/page/admin/adminData";
import { cn } from "@/lib/utils/cn";
import {
  FiFolder,
  FiPlus,
  FiFilter,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiCalendar,
  FiUsers,
  FiMoreVertical,
  FiEdit,
  FiEye,
  FiSearch,
} from "react-icons/fi";

/**
 * Projects dashboard client island.
 * Receives SSR data and preserves interactivity (filters, pagination, view).
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.initialProjects - Initial project list
 * @param {Object} props.initialPagination - Pagination metadata
 * @param {Object} props.initialStats - Header statistics object
 * @param {string} [props.initialSearch=""] - Initial search term
 * @param {string} [props.initialStatus="all"] - Initial status filter
 * @param {string} [props.initialPriority="all"] - Initial priority filter
 * @param {number} [props.initialPage=1] - Initial page index
 * @param {number} [props.initialLimit=12] - Initial page size
 * @returns {JSX.Element}
 */
export default function ProjectsPageClient({
  initialProjects,
  initialPagination,
  initialStats,
  initialSearch = "",
  initialStatus = "all",
  initialPriority = "all",
  initialPage = 1,
  initialLimit = 12,
}) {
  useBlockClientRole();
  const { notifyError } = useToastNotifications();

  const [projects, setProjects] = useState(initialProjects || []);
  const [stats, setStats] = useState(initialStats || null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState(
    initialPagination || {
      page: initialPage,
      limit: initialLimit,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    }
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [viewMode, setViewMode] = useState("grid");
  const [skipInitialFetch, setSkipInitialFetch] = useState(true);

  useEffect(() => {
    setSkipInitialFetch(false);
  }, []);

  async function fetchProjects(filters = {}) {
    const params = new URLSearchParams({
      page: String(filters.page || pagination.page),
      limit: String(filters.limit || pagination.limit),
      scope: "all",
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);

    const res = await fetch(`/api/projects?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  }

  async function fetchProjectStats() {
    const res = await fetch(`/api/projects/stats?scope=all`);
    if (!res.ok) throw new Error("Failed to fetch project stats");
    return res.json();
  }

  async function loadProjects() {
    try {
      setLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined,
        priority: priorityFilter !== "all" ? priorityFilter.toUpperCase() : undefined,
      };
      const data = await fetchProjects(filters);
      setProjects(data.projects || []);
      setPagination(data.pagination || pagination);
    } catch (e) {
      notifyError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      setStatsLoading(true);
      const s = await fetchProjectStats();
      setStats(s);
    } catch (e) {
      // toast shown by caller
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    if (skipInitialFetch) return;
    loadProjects();
  }, [pagination.page, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    if (skipInitialFetch) return;
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipInitialFetch]);

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }
  function handleStatusFilterChange(e) {
    setStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }
  function handlePriorityFilterChange(e) {
    setPriorityFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }
  function handlePageChange(newPage) {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }

  function renderTeamAvatars(teamMembers, maxShow = 3) {
    if (!teamMembers || teamMembers.length === 0) return null;
    const showCount = Math.min(teamMembers.length, maxShow);
    const remainingCount = teamMembers.length - maxShow;
    return (
      <div className="flex items-center -space-x-2">
        {teamMembers.slice(0, showCount).map((member, index) => (
          <span
            key={member.clerkId || index}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          >
            {getInitials(member.name || member.email)}
          </span>
        ))}
        {remainingCount > 0 ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground">
            +{remainingCount}
          </span>
        ) : null}
      </div>
    );
  }

  const statsCards = useMemo(() => {
    if (!stats) return [];
    return statsConfig.map((stat) => ({
      label: stat.label,
      value: stat.value(stats),
      change: stat.change(stats),
      isPositive: stat.isPositive(stats),
      color: stat.color,
      Icon: stat.icon,
    }));
  }, [stats]);

  function renderStatsSection() {
    if (statsLoading) return <DashboardStatsSkeleton />;
    if (!statsCards.length) return null;
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <div key={card.label} className="flex h-full items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div>
              <p className="text-2xl font-semibold text-foreground">{card.value}</p>
              <p className="mt-1 text-sm text-muted">{card.label}</p>
              <p
                className={cn(
                  "mt-3 inline-flex items-center gap-1 text-xs font-semibold",
                  card.isPositive ? "text-emerald-500" : "text-red-500",
                )}
              >
                <FiTrendingUp className="h-4 w-4" aria-hidden="true" />
                {card.change}
              </p>
            </div>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: card.color }}
            >
              <card.Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderProjectsGrid() {
    if (loading) {
      return (
        <GridLoading
          CardComponent={ProjectCardSkeleton}
          columns="repeat(auto-fill, minmax(340px, 1fr))"
          count={6}
        />
      );
    }

    if (projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
          <FiFolder className="h-12 w-12 text-muted" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No projects found</h3>
          <p className="mt-2 text-sm text-muted">
            {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "Get started by creating your first project."}
          </p>
          <Button className="mt-4 gap-2">
            <FiPlus className="h-4 w-4" aria-hidden="true" />
            Create Project
          </Button>
        </div>
      );
    }

    return (
      <div className={cn(viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4") }>
        {projects.map((project) => {
          const badgeVariant = getStatusVariant[project.status?.toUpperCase()] || "default";
          const badgeClasses =
            badgeVariant === "completed"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
              : badgeVariant === "inProgress"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
              : badgeVariant === "planning"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200"
              : badgeVariant === "onHold"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
              : badgeVariant === "cancelled"
              ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200"
              : "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200";

          return viewMode === "grid" ? (
            <div key={project.id} className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">{project.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                    <FiUsers className="h-4 w-4" aria-hidden="true" />
                    {project.client?.companyName || "No client"}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <FiCalendar className="h-3 w-3" aria-hidden="true" />
                    {project.startDate ? formatDate(project.startDate) : "No start"} –
                    {project.endDate ? formatDate(project.endDate) : "No end"}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-hover"
                  aria-label="Project actions"
                >
                  <FiMoreVertical className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 inline-flex items-center gap-2">
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", badgeClasses)}>
                  {project.status?.replace("_", " ") || "Unknown"}
                </span>
                {project.isOverdue ? (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-200">
                    Overdue
                  </span>
                ) : null}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted">
                  <span>Progress</span>
                  <span className="text-foreground">{project.progress || 0}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${project.progress || 0}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                {renderTeamAvatars(project.teamMembers)}
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-9 gap-2 px-3" type="button">
                    <FiEye className="h-4 w-4" aria-hidden="true" />
                    View
                  </Button>
                  <Button variant="secondary" className="h-9 gap-2 px-3" type="button">
                    <FiEdit className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div key={project.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-semibold text-foreground">{project.name}</p>
                  <p className="mt-1 text-sm text-muted">{project.client?.companyName || "No client"}</p>
                  <p className="mt-1 text-xs text-muted">
                    {project.startDate ? formatDate(project.startDate) : "No start"} –
                    {project.endDate ? formatDate(project.endDate) : "No end"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", badgeClasses)}>
                    {project.status?.replace("_", " ") || "Unknown"}
                  </span>
                  <span className="text-xs font-semibold text-muted">{project.progress || 0}%</span>
                  <Button variant="secondary" className="h-8 gap-2 px-3" type="button">
                    <FiEye className="h-4 w-4" aria-hidden="true" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted">Track and manage all your projects from planning to completion.</p>
        </div>
      </div>

      {renderStatsSection()}

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative w-full md:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3 md:justify-end">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOption.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={handlePriorityFilterChange}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {priorityOption.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" className="gap-2">
            <FiFilter className="h-4 w-4" aria-hidden="true" />
            More Filters
          </Button>
        </div>
      </div>

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
          Grid View
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
          Table View
        </button>
      </div>

      {renderProjectsGrid()}

      {pagination.totalPages > 1 ? (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted sm:flex-row">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} total
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="gap-2"
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
