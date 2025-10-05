// src/app/admin/AdminPageClient.jsx
/** @module admin/AdminPageClient */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/shadcn/Button";
import { useToastNotifications } from "@/components/ui/Toast";
import { useWorkflowEvents } from "@/hooks/useWorkflowEvents";
import { quickActions, getActivityIcon, getActivityColor } from "@/data/page/admin/adminData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiBarChart,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiDollarSign,
  FiFolder,
  FiTrendingUp,
  FiUsers,
  FiUserPlus,
} from "react-icons/fi";

/**
 * Default deliverable progress shape.
 * @type {{total:number, approved:number, readyForReview:number, blocked:number, inProgress:number, backlog:number, deferred:number}}
 */
const EMPTY_PROGRESS = {
  total: 0,
  approved: 0,
  readyForReview: 0,
  blocked: 0,
  inProgress: 0,
  backlog: 0,
  deferred: 0,
};

/**
 * Tailwind color tokens keyed by task status.
 * @type {Record<string, string>}
 */
const STATUS_BADGE_CLASSES = {
  BACKLOG: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200",
  BLOCKED: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200",
  READY_FOR_REVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-200",
  CLIENT_APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200",
  DONE: "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-200",
  default: "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-200",
};

/**
 * Returns a color-coded badge for task status values.
 *
 * @param {string} status - Workflow status string.
 * @returns {JSX.Element}
 */
function StatusBadge({ status }) {
  const tone = STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.default;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tone)}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

/**
 * Displays a single stat card with icon and delta copy.
 *
 * @param {Object} props - Component props.
 * @param {string} props.title - Label for the stat tile.
 * @param {string|number} props.value - Primary value.
 * @param {string} props.delta - Secondary delta label.
 * @param {boolean} props.isPositive - Whether delta is an improvement.
 * @param {Function} props.icon - Icon component to render.
 * @param {string} props.accent - Tailwind color token for the icon wrapper.
 * @returns {JSX.Element}
 */
function StatCard({ title, value, delta, isPositive, icon: Icon, accent }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          <p
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-emerald-500" : "text-red-500",
            )}
          >
            <FiTrendingUp className="h-4 w-4" aria-hidden="true" />
            {delta}
          </p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white", accent)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders a quick action shortcut card.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.action - Quick action metadata.
 * @returns {JSX.Element}
 */
function QuickActionCard({ action }) {
  const Icon = action.icon;
  return (
    <a
      href={action.href}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: action.color }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{action.title}</span>
        <span className="text-xs text-muted">{action.description}</span>
      </span>
      <FiArrowRight className="ml-auto h-4 w-4 text-muted" aria-hidden="true" />
    </a>
  );
}

/**
 * Calculates project progress based on completed tasks.
 *
 * @param {Object} project - Project record including task list.
 * @returns {number} Percentage completion between 0 and 100.
 */
function calculateProjectProgress(project) {
  if (!project?.tasks || project.tasks.length === 0) {
    return 0;
  }
  const completed = project.tasks.filter((task) => task.status === "DONE").length;
  return Math.round((completed / project.tasks.length) * 100);
}

/**
 * Formats deliverable gate metrics for display.
 *
 * @param {Object} progress - Deliverable progress snapshot.
 * @returns {Array<{label: string, value: number, tone: string}>}
 */
function buildDeliverableMetrics(progress) {
  return [
    { label: "Approved", value: progress?.approved || 0, tone: "text-emerald-500" },
    { label: "Ready for review", value: progress?.readyForReview || 0, tone: "text-amber-500" },
    { label: "Blocked", value: progress?.blocked || 0, tone: "text-red-500" },
    { label: "Deferred", value: progress?.deferred || 0, tone: "text-purple-500" },
  ];
}

/**
 * Computes stacked bar segments for deliverable status visualization.
 *
 * @param {Object} progress - Deliverable progress summary.
 * @returns {Array<{tone: string, width: number}>}
 */
function buildDeliverableSegments(progress) {
  if (!progress?.total) {
    return [];
  }
  const { total, approved, readyForReview, blocked } = progress;
  const remaining = Math.max(total - (approved + readyForReview + blocked), 0);
  return [
    { tone: "bg-emerald-500", width: (approved / total) * 100 },
    { tone: "bg-amber-500", width: (readyForReview / total) * 100 },
    { tone: "bg-red-500", width: (blocked / total) * 100 },
    { tone: "bg-slate-300 dark:bg-slate-600", width: (remaining / total) * 100 },
  ].filter((segment) => segment.width > 0);
}

/**
 * Admin dashboard client component.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.initialStats - Prefetched stats payload.
 * @param {Array<Object>} props.initialRecentProjects - Recent project summaries.
 * @param {Array<Object>} props.initialUpcomingTasks - Upcoming tasks collection.
 * @param {Array<Object>} props.initialRecentActivity - Activity feed rows.
 * @param {Array<Object>} [props.initialReadyForReview] - Tasks awaiting review.
 * @param {Array<Object>} [props.initialBlockedTasks] - Blocked task list.
 * @param {Array<Object>} [props.initialDependencyAlerts] - Dependency alerts.
 * @param {Object} [props.initialDeliverableProgress] - Deliverable summary.
 * @param {Array<Object>} [props.initialUpcomingDeliverables] - Upcoming deliverables.
 * @param {Array<Object>} [props.initialBillingSummaries] - Billing readiness summaries.
 * @returns {JSX.Element}
 */
export default function AdminPageClient({
  initialStats,
  initialRecentProjects,
  initialUpcomingTasks,
  initialRecentActivity,
  initialReadyForReview = [],
  initialBlockedTasks = [],
  initialDependencyAlerts = [],
  initialDeliverableProgress = EMPTY_PROGRESS,
  initialUpcomingDeliverables = [],
  initialBillingSummaries = [],
}) {
  const router = useRouter();
  const { notifyError } = useToastNotifications();
  const [statsLoading, setStatsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [stats, setStats] = useState(initialStats || null);
  const [recentProjects, setRecentProjects] = useState(initialRecentProjects || []);
  const [upcomingTasks, setUpcomingTasks] = useState(initialUpcomingTasks || []);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity || []);
  const [readyForReviewTasks, setReadyForReviewTasks] = useState(initialReadyForReview || []);
  const [blockedTasks, setBlockedTasks] = useState(initialBlockedTasks || []);
  const [dependencyAlerts, setDependencyAlerts] = useState(initialDependencyAlerts || []);
  const [deliverableProgress, setDeliverableProgress] = useState(
    initialDeliverableProgress || EMPTY_PROGRESS,
  );
  const [upcomingDeliverableList, setUpcomingDeliverableList] = useState(
    initialUpcomingDeliverables || [],
  );
  const [billingSummaries, setBillingSummaries] = useState(initialBillingSummaries || []);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    setStats(initialStats || null);
  }, [initialStats]);
  useEffect(() => {
    setRecentProjects(initialRecentProjects || []);
  }, [initialRecentProjects]);
  useEffect(() => {
    setUpcomingTasks(initialUpcomingTasks || []);
  }, [initialUpcomingTasks]);
  useEffect(() => {
    setRecentActivity(initialRecentActivity || []);
  }, [initialRecentActivity]);
  useEffect(() => {
    setReadyForReviewTasks(initialReadyForReview || []);
  }, [initialReadyForReview]);
  useEffect(() => {
    setBlockedTasks(initialBlockedTasks || []);
  }, [initialBlockedTasks]);
  useEffect(() => {
    setDependencyAlerts(initialDependencyAlerts || []);
  }, [initialDependencyAlerts]);
  useEffect(() => {
    setDeliverableProgress(initialDeliverableProgress || EMPTY_PROGRESS);
  }, [initialDeliverableProgress]);
  useEffect(() => {
    setUpcomingDeliverableList(initialUpcomingDeliverables || []);
  }, [initialUpcomingDeliverables]);
  useEffect(() => {
    setBillingSummaries(initialBillingSummaries || []);
  }, [initialBillingSummaries]);

  const deliverableSegments = useMemo(
    () => buildDeliverableSegments(deliverableProgress),
    [deliverableProgress],
  );
  const deliverableMetrics = useMemo(
    () => buildDeliverableMetrics(deliverableProgress),
    [deliverableProgress],
  );
  const dependencyAlertIds = useMemo(
    () => new Set((dependencyAlerts || []).map((alert) => alert.id)),
    [dependencyAlerts],
  );
  const upcomingDeliverables = useMemo(
    () => upcomingDeliverableList.slice(0, 5),
    [upcomingDeliverableList],
  );
  const billingReadyCount = useMemo(
    () => billingSummaries.filter((summary) => summary.ready).length,
    [billingSummaries],
  );

  /**
   * Fetches updated dashboard stats.
   * @returns {Promise<void>}
   */
  async function fetchDashboardStats() {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats`);
      if (res.ok) setStats(await res.json());
    } catch (error) {
      notifyError("Unable to load dashboard statistics");
    } finally {
      setStatsLoading(false);
    }
  }

  /**
   * Fetches recently updated projects.
   * @param {number} [limit=3] - Rows to fetch.
   * @returns {Promise<void>}
   */
  async function fetchRecentProjects(limit = 3) {
    setProjectsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/projects?limit=${limit}`);
      if (res.ok) setRecentProjects(await res.json());
    } catch (error) {
      // Silent failure
    } finally {
      setProjectsLoading(false);
    }
  }

  /**
   * Fetches upcoming tasks.
   * @param {number} [limit=5] - Rows to fetch.
   * @returns {Promise<void>}
   */
  async function fetchUpcomingTasks(limit = 5) {
    setTasksLoading(true);
    try {
      const res = await fetch(`/api/dashboard/tasks?limit=${limit}`);
      if (res.ok) setUpcomingTasks(await res.json());
    } catch (error) {
      // Silent failure
    } finally {
      setTasksLoading(false);
    }
  }

  /**
   * Fetches recent activity rows.
   * @param {number} [limit=5] - Rows to fetch.
   * @returns {Promise<void>}
   */
  async function fetchRecentActivity(limit = 5) {
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/dashboard/activity?limit=${limit}`);
      if (res.ok) setRecentActivity(await res.json());
    } catch (error) {
      // Silent failure
    } finally {
      setActivityLoading(false);
    }
  }

  /**
   * Reacts to workflow websocket events by refreshing the route.
   *
   * @param {Object} payload - Workflow event payload.
   * @returns {void}
   */
  function handleWorkflowEvent(payload) {
    if (!payload || payload.type !== "workflow.event") return;
    const { event } = payload;
    if (!event || !event.entity) return;
    const refreshable = ["intake", "proposal", "project", "invoice", "task"];
    if (!refreshable.includes(event.entity)) return;
    const now = Date.now();
    if (now - lastRefreshAtRef.current < 3000) return;
    lastRefreshAtRef.current = now;
    router.refresh();
  }

  useWorkflowEvents({ onEvent: handleWorkflowEvent });

  /**
   * Metric cards presented at the top of the dashboard.
   * @type {Array<Object>}
   */
  const statsCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? "0",
      delta: `${stats?.projectsChange >= 0 ? "+" : ""}${stats?.projectsChange ?? 0} this month`,
      isPositive: (stats?.projectsChange ?? 0) >= 0,
      icon: FiFolder,
      accent: "bg-blue-500",
    },
    {
      title: "Active Clients",
      value: stats?.activeClients ?? "0",
      delta: `${stats?.clientsChange >= 0 ? "+" : ""}${stats?.clientsChange ?? 0} this month`,
      isPositive: (stats?.clientsChange ?? 0) >= 0,
      icon: FiUsers,
      accent: "bg-emerald-500",
    },
    {
      title: "Client Signups",
      value: stats?.totalClientSignups ?? "0",
      delta: `${stats?.clientSignupsChange >= 0 ? "+" : ""}${
        stats?.clientSignupsChange ?? 0
      } vs last month`,
      isPositive: (stats?.clientSignupsChange ?? 0) >= 0,
      icon: FiUserPlus,
      accent: "bg-indigo-500",
    },
    {
      title: "Pending Tasks",
      value: stats?.pendingTasks ?? "0",
      delta: `${stats?.tasksChange >= 0 ? "+" : ""}${stats?.tasksChange ?? 0} today`,
      isPositive: (stats?.tasksChange ?? 0) <= 0,
      icon: FiCheckSquare,
      accent: "bg-amber-500",
    },
    {
      title: "Revenue (MTD)",
      value: formatCurrency(stats?.monthlyRevenue ?? 0),
      delta: `${stats?.revenueChangePercent >= 0 ? "+" : ""}${stats?.revenueChangePercent ?? 0}% vs last month`,
      isPositive: (stats?.revenueChange ?? 0) >= 0,
      icon: FiDollarSign,
      accent: "bg-rose-500",
    },
    {
      title: "Deliverables",
      value: `${deliverableProgress?.approved ?? 0}/${deliverableProgress?.total ?? 0}`,
      delta: `${deliverableProgress?.readyForReview ?? 0} waiting review`,
      isPositive: (deliverableProgress?.approved ?? 0) >= (deliverableProgress?.blocked ?? 0),
      icon: FiClipboard,
      accent: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted">
            Welcome back! Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Button className="w-full sm:w-auto" variant="secondary" onClick={fetchDashboardStats}>
          <FiBarChart className="mr-2 h-4 w-4" aria-hidden="true" />
          Refresh insights
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {statsLoading
          ? Array.from({ length: statsCards.length }).map((_, index) => (
              <div
                key={`stat-skeleton-${index}`}
                className="h-32 rounded-2xl border border-border bg-surface shadow-sm"
              >
                <div className="h-full animate-pulse rounded-2xl bg-surface-hover" />
              </div>
            ))
          : statsCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} action={action} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent projects</h2>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:text-primary-hover"
                onClick={() => fetchRecentProjects(5)}
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {projectsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={`project-skeleton-${idx}`} className="h-16 animate-pulse rounded-xl bg-surface-hover" />
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <p className="text-sm text-muted">No recent project updates yet.</p>
              ) : (
                recentProjects.map((project) => {
                  const progress = calculateProjectProgress(project);
                  return (
                    <div
                      key={project.id}
                      className="rounded-xl border border-border bg-background px-4 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{project.name}</p>
                          <p className="text-xs text-muted">{project.client.companyName}</p>
                        </div>
                        <span className="text-xs font-medium text-muted">{project._count?.tasks ?? 0} tasks</span>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${progress}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted">{progress}% complete</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Upcoming tasks</h2>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                  onClick={() => fetchUpcomingTasks(5)}
                >
                  Refresh
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {tasksLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={`task-skeleton-${idx}`} className="h-14 animate-pulse rounded-xl bg-surface-hover" />
                    ))}
                  </div>
                ) : upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted">All caught up for now.</p>
                ) : (
                  upcomingTasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-border bg-background px-3 py-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted">{task.project}</p>
                        </div>
                        <StatusBadge status={task.status || "BACKLOG"} />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        <FiCalendar className="mr-1 inline h-3 w-3" aria-hidden="true" />
                        {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Ready for review</h2>
                <span className="text-xs font-medium text-muted">{readyForReviewTasks.length} tasks</span>
              </div>
              <div className="mt-4 space-y-4">
                {readyForReviewTasks.length === 0 ? (
                  <p className="text-sm text-muted">Nothing is waiting on your review.</p>
                ) : (
                  readyForReviewTasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="rounded-xl border border-border bg-background px-3 py-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted">{task.project?.name}</p>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Owner: {task.assignee?.name || "Unassigned"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Blocked items</h2>
              <span className="text-xs font-medium text-muted">{blockedTasks.length} tasks</span>
            </div>
            <div className="mt-4 space-y-3">
              {blockedTasks.length === 0 ? (
                <p className="text-sm text-muted">No blockers detected.</p>
              ) : (
                blockedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-xl border border-border bg-background px-3 py-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted">{task.project?.name}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.latestStatusNote ? (
                      <p className="mt-1 text-xs text-muted">{task.latestStatusNote}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Deliverable health</h2>
              <span className="text-xs font-medium text-muted">{deliverableProgress.total} total</span>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-hover">
              {deliverableSegments.length === 0 ? (
                <div className="h-full w-full bg-surface-hover" aria-hidden="true" />
              ) : (
                deliverableSegments.map((segment, index) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={`segment-${segment.tone}-${index}`}
                    className={cn("h-full", segment.tone)}
                    style={{ width: `${segment.width}%` }}
                  />
                ))
              )}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {deliverableMetrics.map((metric) => (
                <div key={metric.label} className="rounded-lg bg-background p-3">
                  <dt className="text-xs text-muted">{metric.label}</dt>
                  <dd className={cn("mt-1 text-base font-semibold", metric.tone)}>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Upcoming deliverables</h2>
              <span className="text-xs font-medium text-muted">{upcomingDeliverables.length} items</span>
            </div>
            <div className="mt-4 space-y-3">
              {upcomingDeliverables.length === 0 ? (
                <p className="text-sm text-muted">No deliverables due in the next two weeks.</p>
              ) : (
                upcomingDeliverables.map((deliverable) => (
                  <div key={deliverable.id} className="rounded-xl border border-border bg-background px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{deliverable.title}</p>
                    <p className="text-xs text-muted">{deliverable.project.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      Due {deliverable.dueDate ? formatDate(deliverable.dueDate) : "soon"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Billing readiness</h2>
              <span className="text-xs font-medium text-muted">{billingReadyCount} ready</span>
            </div>
            <div className="mt-4 space-y-3">
              {billingSummaries.length === 0 ? (
                <p className="text-sm text-muted">No billing updates yet.</p>
              ) : (
                billingSummaries.slice(0, 5).map((summary) => (
                  <div
                    key={summary.projectId}
                    className="rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{summary.projectName}</p>
                      {summary.ready ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                          {summary.pendingDeliverables} blockers
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{summary.clientName}</p>
                    <p className="mt-1 text-xs text-muted">{summary.summary}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:text-primary-hover"
                onClick={() => fetchRecentActivity(5)}
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {activityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={`activity-skeleton-${idx}`} className="h-12 animate-pulse rounded-xl bg-surface-hover" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-muted">No activity logged yet.</p>
              ) : (
                recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon[activity.type] || getActivityIcon.default;
                  const tone = getActivityColor[activity.type] || getActivityColor.default;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-border bg-background px-3 py-2">
                      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${tone}1A` }}>
                        <ActivityIcon className="h-4 w-4" style={{ color: tone }} aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.description}</p>
                        <p className="text-xs text-muted">{activity.timeAgo}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Dependency alerts</h2>
              <span className="text-xs font-medium text-muted">{dependencyAlerts.length} alerts</span>
            </div>
            <div className="mt-4 space-y-3">
              {dependencyAlerts.length === 0 ? (
                <p className="text-sm text-muted">No dependency issues right now.</p>
              ) : (
                dependencyAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <FiAlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted">{alert.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
