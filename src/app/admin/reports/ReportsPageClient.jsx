// src/app/admin/reports/ReportsPageClient.jsx
/** @module admin/reports/ReportsPageClient */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/shadcn/Button";
import {
  FiDownload,
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiBarChart,
  FiDollarSign,
  FiFolder,
  FiCheckSquare,
  FiClock,
  FiFilter,
} from "react-icons/fi";
import { cn } from "@/lib/utils/cn";
import {
  dateRangeOptions,
  projectFilterOptions,
  teamFilterOptions,
} from "@/data/page/admin/reports/reportsData";

const ICON_MAP = {
  FiBarChart,
  FiCheckSquare,
  FiDollarSign,
  FiFolder,
  FiClock,
  FiTrendingUp,
};

/**
 * Reports and analytics dashboard for admins.
 *
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.initialMetrics - High-level metric cards.
 * @param {Array<Object>} props.initialProjectStats - Status distribution data.
 * @param {Array<Object>} props.initialTeamPerformance - Team performance entries.
 * @param {Array<Object>} props.initialRecentActivity - Recent activity feed items.
 * @param {string} [props.initialDateRange="last-30-days"] - Seeded date range filter.
 * @returns {JSX.Element}
 */
export default function ReportsPageClient({
  initialMetrics,
  initialProjectStats,
  initialTeamPerformance,
  initialRecentActivity,
  initialDateRange = "last-30-days",
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [dateRange, setDateRange] = useState(initialDateRange);
  const [projectFilter, setProjectFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [metrics, setMetrics] = useState(initialMetrics || []);
  const [projectStats, setProjectStats] = useState(initialProjectStats || []);
  const [teamPerformance, setTeamPerformance] = useState(initialTeamPerformance || []);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity || []);
  const [error, setError] = useState(null);

  const filteredTeamPerformance = useMemo(() => {
    if (teamFilter === "all") return teamPerformance;
    return teamPerformance.filter((member) => member.role === teamFilter);
  }, [teamFilter, teamPerformance]);

  function pushDateRange(value) {
    const params = new URLSearchParams();
    if (value && value !== "last-30-days") {
      params.set("dateRange", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch(`/api/reports?dateRange=${dateRange}`);
      if (!response.ok) {
        throw new Error("Unable to refresh analytics");
      }
      const payload = await response.json();
      setMetrics(payload.metrics || []);
      setProjectStats(payload.projectStats || []);
      setTeamPerformance(payload.teamPerformance || []);
      setRecentActivity(payload.recentActivity || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to refresh analytics");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports &amp; Analytics</h1>
          <p className="text-sm text-muted">Comprehensive insights into business performance and team productivity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="secondary"
            className={cn("gap-2", refreshing && "opacity-70")}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden="true" />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Button variant="secondary" className="gap-2">
            <FiDownload className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
          <Button className="gap-2">
            <FiPlus className="h-4 w-4" aria-hidden="true" />
            Create Report
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-400 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <Button variant="secondary" className="gap-2" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="reports-date-range" className="text-xs font-semibold uppercase tracking-wide text-muted">
              Date range
            </label>
            <select
              id="reports-date-range"
              value={dateRange}
              onChange={(event) => {
                const value = event.target.value;
                setDateRange(value);
                pushDateRange(value);
              }}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reports-project-filter" className="text-xs font-semibold uppercase tracking-wide text-muted">
              Projects
            </label>
            <select
              id="reports-project-filter"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {projectFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reports-team-filter" className="text-xs font-semibold uppercase tracking-wide text-muted">
              Team
            </label>
            <select
              id="reports-team-filter"
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {teamFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button variant="secondary" className="gap-2 self-start md:self-end">
          <FiFilter className="h-4 w-4" aria-hidden="true" />
          Advanced filters
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = ICON_MAP[metric.icon] || FiBarChart;
          return (
            <div key={metric.label} className="flex h-full items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div>
                <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
                <p className="mt-1 text-sm text-muted">{metric.label}</p>
                <p
                  className={cn(
                    "mt-3 inline-flex items-center gap-1 text-xs font-semibold",
                    metric.isPositive ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {metric.isPositive ? (
                    <FiTrendingUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <FiTrendingDown className="h-4 w-4" aria-hidden="true" />
                  )}
                  {metric.change}
                </p>
                <p className="mt-1 text-xs text-muted">{metric.subtitle}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: metric.color }}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Revenue trends</p>
              <p className="text-xs text-muted">Monthly revenue over the selected period.</p>
            </div>
            <Button variant="secondary" className="gap-2" size="sm">
              <FiBarChart className="h-4 w-4" aria-hidden="true" />
              View details
            </Button>
          </div>
          <div className="flex h-48 items-center justify-center px-5 py-8 text-sm text-muted">
            📊 Revenue chart placeholder
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Project status distribution</p>
            <p className="text-xs text-muted">Breakdown of projects by current status.</p>
          </div>
          <div className="px-5 py-4">
            {projectStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 text-sm text-muted">
                <div className="flex items-center gap-3">
                  <span style={{ backgroundColor: item.color }} className="inline-block h-2.5 w-2.5 rounded-full" />
                  <span>{item.label}</span>
                </div>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Team performance</p>
            <p className="text-xs text-muted">Task throughput and efficiency.</p>
          </div>
          <div className="px-5 py-4">
            {filteredTeamPerformance.length === 0 ? (
              <p className="text-sm text-muted">No team performance data available.</p>
            ) : (
              filteredTeamPerformance.map((member) => (
                <div key={member.name} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {member.avatar}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <span>{member.tasksCompleted} tasks</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-hover">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${member.efficiency}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-xs text-muted">{member.efficiency}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Recent activity</p>
            <p className="text-xs text-muted">Latest updates and achievements.</p>
          </div>
          <div className="px-5 py-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted">No recent activity logged.</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 border-b border-border py-3 last:border-b-0">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: activity.color || "#3b82f6" }}
                  >
                    ✓
                  </span>
                  <div>
                    <p className="text-sm text-foreground">{activity.text || activity.description}</p>
                    <p className="text-xs text-muted">{activity.time || activity.timeAgo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Top performing projects</p>
            <p className="text-xs text-muted">Projects ranked by profitability and completion rate.</p>
          </div>
          <Button variant="secondary" className="gap-2" size="sm">
            <FiDownload className="h-4 w-4" aria-hidden="true" />
            Export table
          </Button>
        </div>
        <div className="overflow-hidden">
          <div className="hidden bg-background text-xs font-semibold uppercase tracking-wide text-muted md:grid md:grid-cols-[1.5fr,1fr,120px,120px,120px,120px] md:gap-4 md:px-6 md:py-3">
            <span>Project</span>
            <span>Client</span>
            <span className="text-right">Revenue</span>
            <span className="text-right">Profit Margin</span>
            <span className="text-right">Completion</span>
            <span className="text-right">Team Size</span>
          </div>
          <div className="px-4 py-4 text-sm text-muted md:px-6">
            <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 md:grid-cols-[1.5fr,1fr,120px,120px,120px,120px] md:items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">Coming soon</p>
                <p className="text-xs text-muted">Data will be populated from project analytics.</p>
              </div>
              <span>—</span>
              <span className="text-right">—</span>
              <span className="text-right">—</span>
              <span className="text-right">—</span>
              <span className="text-right">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
