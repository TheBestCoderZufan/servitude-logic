// src/app/dashboard/projects/ProjectsPageClient.jsx
"use client";
import React, { useRef } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  Badge,
  Button,
  ProgressBar,
  ProgressFill,
  Avatar,
  Input,
  Select,
} from "@/components/ui/dashboard";
import { FiSearch, FiCalendar, FiUsers, FiFolder, FiCheckCircle, FiClock } from "react-icons/fi";
import { intakeStatusLabel } from "@/data/page/admin/intake/intakeData";
import { clientIntakeStatusBadgeVariants } from "@/data/page/dashboard/projectsClient.data";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

/**
 * @typedef {Object} PendingIntakeSummary
 * @property {string} id - Unique intake identifier.
 * @property {string} status - Workflow status code.
 * @property {string} submittedAt - ISO timestamp of submission.
 * @property {string} projectName - Client provided project name.
 * @property {string} [summary] - Short summary or goal statement.
 * @property {string|null} [budgetRange] - Budget range provided by the client.
 * @property {string|null} [targetLaunch] - Target launch text provided by the client.
 */

/**
 * Client island for the Projects list with SSR-driven filters.
 * Submits a GET form when filters change, letting the server component fetch
 * and render the updated list (SSR filters, pagination, sorting).
 *
 * @param {object} props - Props from the server.
 * @param {Array<object>} props.projects - List of projects with minimal fields.
 * @param {object} props.pagination - Pagination info.
 * @param {number} props.pagination.page - Current page number.
 * @param {number} props.pagination.limit - Items per page.
 * @param {number} props.pagination.totalPages - Total pages.
 * @param {number} props.pagination.totalCount - Total items count.
 * @param {object} props.filters - Current filters (search/status/sort values).
 * @param {boolean} props.intakeSubmitted - Whether the user recently submitted an intake.
 * @param {PendingIntakeSummary[]} [props.pendingIntakes] - Pending intakes tied to the client.
 * @returns {JSX.Element}
 */
export default function ProjectsPageClient({
  projects = [],
  pagination,
  filters,
  intakeSubmitted = false,
  pendingIntakes = [],
}) {
  const formRef = useRef(null);

  const submitOnChange = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const withPage = (page) => {
    const params = new URLSearchParams({
      search: filters.search || "",
      status: filters.status || "all",
      sortBy: filters.sortBy || "updatedAt",
      sortOrder: filters.sortOrder || "desc",
      limit: String(pagination.limit || 12),
      page: String(page),
    });
    return `?${params.toString()}`;
  };

  const hasProjects = projects.length > 0;
  const hasPendingIntakes = pendingIntakes.length > 0;

  return (
    <div className="space-y-10">
      {intakeSubmitted && (
        <div
          role="status"
          aria-live="polite"
          className="flex gap-4 rounded-3xl border border-success/40 bg-success-soft px-6 py-4 text-sm text-success"
        >
          <FiCheckCircle aria-hidden size={20} className="mt-1" />
          <div className="space-y-1">
            <p className="font-semibold">Thanks! Your project intake is under review.</p>
            <p className="text-sm text-success/90">
              Our team is reviewing the details now. We&apos;ll follow up if we need clarification and share an estimation timeline once the request is approved for scoping.
            </p>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground">Your Projects</h1>
          <p className="text-base text-muted">Track progress, milestones, and files</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/projects/new">
            <Button variant="primary" size="sm" className="rounded-xl">
              New Project
            </Button>
          </Link>
        </div>
      </header>

      <form
        ref={formRef}
        method="get"
        role="search"
        className="flex flex-wrap items-center gap-4 rounded-3xl border border-border/70 bg-surface/80 p-4"
      >
        <div className="relative flex-1 min-w-[240px]">
          <FiSearch aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            name="search"
            placeholder="Search projects..."
            defaultValue={filters.search || ""}
            onChange={submitOnChange}
            aria-label="Search projects"
            className="rounded-xl bg-surface pl-11"
          />
        </div>
        <Select
          name="status"
          defaultValue={filters.status || "all"}
          onChange={submitOnChange}
          aria-label="Status filter"
          className="w-full rounded-xl bg-surface sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
        <Select
          name="sortBy"
          defaultValue={filters.sortBy || "updatedAt"}
          onChange={submitOnChange}
          aria-label="Sort by"
          className="w-full rounded-xl bg-surface sm:w-44"
        >
          <option value="updatedAt">Recently Updated</option>
          <option value="createdAt">Recently Created</option>
          <option value="name">Name</option>
          <option value="status">Status</option>
        </Select>
        <Select
          name="sortOrder"
          defaultValue={filters.sortOrder || "desc"}
          onChange={submitOnChange}
          aria-label="Sort order"
          className="w-full rounded-xl bg-surface sm:w-32"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </Select>
        <Select
          name="limit"
          defaultValue={String(pagination.limit || 12)}
          onChange={submitOnChange}
          aria-label="Per page"
          className="w-full rounded-xl bg-surface sm:w-28"
        >
          <option value="6">6</option>
          <option value="12">12</option>
          <option value="24">24</option>
        </Select>
      </form>

      {hasProjects || hasPendingIntakes ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pendingIntakes.map((intake) => {
            const submittedAt = intake.submittedAt ? new Date(intake.submittedAt) : null;
            const badgeVariant = clientIntakeStatusBadgeVariants[intake.status] || "warning";
            return (
              <Card key={`intake-${intake.id}`} className="rounded-3xl">
                <CardContent className="space-y-4 px-6 py-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {intake.projectName}
                      </h3>
                      <p className="text-sm text-muted">
                        <FiClock aria-hidden className="mr-2 inline" /> Submitted {submittedAt ? formatDate(submittedAt) : "recently"}
                      </p>
                    </div>
                    <Badge variant={badgeVariant}>{intakeStatusLabel(intake.status)}</Badge>
                  </div>
                  {intake.summary ? (
                    <p className="text-sm text-foreground/80">{intake.summary}</p>
                  ) : null}
                  {(intake.budgetRange || intake.targetLaunch) && (
                    <ul className="space-y-2 pl-4 text-sm text-muted">
                      {intake.budgetRange ? (
                        <li>
                          <strong className="font-semibold text-foreground">Budget:</strong> {intake.budgetRange}
                        </li>
                      ) : null}
                      {intake.targetLaunch ? (
                        <li>
                          <strong className="font-semibold text-foreground">Target launch:</strong> {intake.targetLaunch}
                        </li>
                      ) : null}
                    </ul>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-3 rounded-3xl border-t border-border/70 bg-surface/80 px-6 py-4 text-sm text-muted">
                  <span>We&apos;ll email you once the team finishes reviewing this request.</span>
                </CardFooter>
              </Card>
            );
          })}

          {projects.map((project) => {
            const total = project._count?.tasks || 0;
            const done = project.tasksDone || 0;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            const statusVariant =
              project.status === "COMPLETED"
                ? "success"
                : project.status === "IN_PROGRESS"
                ? "inProgress"
                : project.status === "ON_HOLD"
                ? "warning"
                : project.status === "CANCELLED"
                ? "error"
                : "planning";

            return (
              <Card key={project.id} className="rounded-3xl">
                <CardContent className="space-y-5 px-6 py-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {project.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                        <FiCalendar aria-hidden />
                        <span>
                          {project.startDate ? formatDate(project.startDate) : "—"}
                          {project.endDate ? ` → ${formatDate(project.endDate)}` : ""}
                        </span>
                      </div>
                    </div>
                    <Badge variant={statusVariant} className="capitalize">
                      {project.status.toLowerCase().replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>Progress</span>
                      <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <ProgressBar className="h-2 bg-border/70">
                      <ProgressFill value={progress} tone="info" />
                    </ProgressBar>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <Avatar size={32} className="bg-accent-soft text-info">
                        <FiUsers aria-hidden />
                      </Avatar>
                      <span>{project.teamSize || 0} team</span>
                    </div>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="secondary" size="sm" className="rounded-lg border border-border/70">
                        <FiFolder aria-hidden className="mr-2" /> View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-surface/80 px-8 py-16 text-center text-muted"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-2xl text-accent">
            <FiFolder aria-hidden />
          </span>
          <h3 className="font-heading text-2xl font-semibold text-foreground">No projects yet</h3>
          <p className="max-w-md text-sm text-muted">
            Submit a project intake request to get your next engagement underway.
          </p>
          <Link href="/dashboard/projects/new">
            <Button variant="primary" size="sm" className="rounded-xl">
              Start a project
            </Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-surface/80 px-6 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <div className="flex gap-3">
          <Link
            href={withPage(Math.max(1, (pagination.page || 1) - 1))}
            aria-disabled={!(pagination.page > 1)}
            className={cn(!(pagination.page > 1) && "pointer-events-none opacity-60")}
          >
            <Button variant="secondary" size="sm" className="rounded-lg" disabled={!(pagination.page > 1)}>
              Prev
            </Button>
          </Link>
          <Link
            href={withPage((pagination.page || 1) + 1)}
            aria-disabled={!(pagination.page < (pagination.totalPages || 1))}
            className={cn(!(pagination.page < (pagination.totalPages || 1)) && "pointer-events-none opacity-60")}
          >
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg"
              disabled={!(pagination.page < (pagination.totalPages || 1))}
            >
              Next
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
/** @module dashboard/projects/ProjectsPageClient */
