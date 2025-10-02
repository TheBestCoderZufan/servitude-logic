// src/app/dashboard/DashboardPageClient.jsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Avatar,
} from "@/components/ui/dashboard";
import {
  FiFolder,
  FiDollarSign,
  FiClock,
  FiFile,
  FiCheckCircle,
  FiClipboard,
  FiCalendar,
  FiSend,
  FiMessageSquare,
  FiArrowRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useProject } from "@/providers/ProjectProvider";
import { useWorkflowEvents } from "@/hooks/useWorkflowEvents";
import { intakeStatusLabel } from "@/data/page/admin/intake/intakeData";
import { clientIntakeStatusBadgeVariants } from "@/data/page/dashboard/projectsClient.data";
import { clientDashboardQuickActions } from "@/data/page/dashboard/clientDashboardPage.data";
import { cn } from "@/lib/utils/cn";

const EMPTY_PROGRESS = {
  total: 0,
  approved: 0,
  readyForReview: 0,
  blocked: 0,
  inProgress: 0,
  backlog: 0,
  deferred: 0,
};

const STATUS_BADGE_VARIANTS = {
  BACKLOG: "default",
  IN_PROGRESS: "primary",
  BLOCKED: "error",
  READY_FOR_REVIEW: "warning",
  CLIENT_APPROVED: "success",
  DONE: "completed",
};

/**
 * Maps invoice status codes to badge variants for the outstanding list.
 * @type {Record<string, string>}
 */
const INVOICE_BADGE_VARIANTS = {
  OVERDUE: "error",
  SENT: "warning",
  PAID: "success",
  DRAFT: "default",
};

/**
 * Associates quick action icon identifiers with their React Icon counterparts.
 * @type {Record<string, React.ComponentType>}
 */
const QUICK_ACTION_ICON_MAP = {
  FiFolder,
  FiDollarSign,
  FiMessageSquare,
};

/**
 * Maps burndown segment tones to Tailwind background utilities.
 * @type {Record<string, string>}
 */
const BURNDOWN_TONE_CLASSES = {
  approved: "bg-success",
  review: "bg-info",
  blocked: "bg-error",
  remaining: "bg-accent",
};

/**
 * Maps summary pill variants to Tailwind color tokens.
 * @type {Record<string, string>}
 */
const SUMMARY_PILL_CLASSES = {
  positive: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  negative: "bg-error-soft text-error",
};

/**
 * Extracts the first name from the provided contact string.
 *
 * @param {string|null|undefined} contactName - Full contact name captured for the client.
 * @returns {string|null} First name when available, otherwise null.
 */
function getFirstName(contactName) {
  if (!contactName || typeof contactName !== "string") {
    return null;
  }
  const trimmed = contactName.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.split(" ")[0];
}

/**
 * Determines a due-date badge label and variant for task summaries.
 *
 * @param {string|Date|null|undefined} dueDate - Raw due date value.
 * @returns {{ label: string, variant: "error"|"warning"|"default" }} Status label and badge variant.
 */
function getDueStatus(dueDate) {
  if (!dueDate) {
    return { label: "No due date", variant: "default" };
  }
  const compare = new Date(dueDate).getTime();
  if (Number.isNaN(compare)) {
    return { label: "No due date", variant: "default" };
  }

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  if (compare < now - oneDay) {
    return { label: "Overdue", variant: "error" };
  }
  if (compare - now <= 3 * oneDay) {
    return { label: "Due soon", variant: "warning" };
  }
  return { label: "Scheduled", variant: "default" };
}

/**
 * Dashboard client island that renders the dashboard UI with SSR-provided data.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.initialProjects - Initial project list (scoped by server).
 * @param {Array<object>} props.initialInvoices - Initial invoice list (scoped by server).
 * @param {Array<object>} props.initialTasks - Initial task list (scoped by server).
 * @param {Array<object>} props.initialFiles - Initial recent files list (scoped by server).
 * @param {Array<object>} props.initialDeliverables - Initial deliverable list.
 * @param {object} props.initialDeliverableProgress - Aggregated deliverable progress counts.
 * @param {object|null} props.initialBillingSummary - Billing readiness summary when focused on a single project.
 * @param {Array<object>} props.initialPendingIntakes - Pending intake submissions awaiting review.
 * @param {{contactName: string|null, companyName: string|null}|null} props.clientProfile - Lightweight client profile for personalization.
 * @returns {JSX.Element} Dashboard content.
 */
export default function DashboardPageClient({
  initialProjects = [],
  initialInvoices = [],
  initialTasks = [],
  initialFiles = [],
  initialDeliverables = [],
  initialDeliverableProgress = EMPTY_PROGRESS,
  initialBillingSummary = null,
  initialPendingIntakes = [],
  clientProfile = null,
}) {
  const router = useRouter();
  const { selectedProject } = useProject();
  const [projects, setProjects] = useState(initialProjects);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [tasks, setTasks] = useState(initialTasks);
  const [files, setFiles] = useState(initialFiles);
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [deliverableProgress, setDeliverableProgress] = useState(
    initialDeliverableProgress || EMPTY_PROGRESS,
  );
  const [billingSummary, setBillingSummary] = useState(initialBillingSummary);
  const [pendingIntakes, setPendingIntakes] = useState(initialPendingIntakes);
  const [clientProfileState, setClientProfileState] = useState(clientProfile);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    setDeliverables(initialDeliverables);
  }, [initialDeliverables]);

  useEffect(() => {
    setDeliverableProgress(initialDeliverableProgress || EMPTY_PROGRESS);
  }, [initialDeliverableProgress]);

  useEffect(() => {
    setBillingSummary(initialBillingSummary);
  }, [initialBillingSummary]);

  useEffect(() => {
    setPendingIntakes(initialPendingIntakes);
  }, [initialPendingIntakes]);

  useEffect(() => {
    setClientProfileState(clientProfile);
  }, [clientProfile]);

  const stats = useMemo(() => {
    const activeProjects = projects.filter((project) =>
      ["PLANNING", "IN_PROGRESS"].includes(project.status),
    ).length;
    const outstanding = invoices
      .filter((invoice) => ["SENT", "OVERDUE"].includes(invoice.status))
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const pendingDeliverables = deliverables.filter(
      (deliverable) => deliverable.status !== "CLIENT_APPROVED",
    ).length;
    const recentFiles = files.slice(0, 5);
    const pendingRequests = pendingIntakes.length;
    return { activeProjects, outstanding, pendingDeliverables, recentFiles, pendingRequests };
  }, [projects, invoices, deliverables, files, pendingIntakes]);

  const recentActivity = useMemo(() => {
    const now = Date.now();
    const within7d = (date) =>
      (now - new Date(date).getTime()) / (1000 * 60 * 60 * 24) <= 7;
    const items = [];
    invoices
      .filter(
        (invoice) => ["SENT", "PAID"].includes(invoice.status) && within7d(invoice.issueDate),
      )
      .slice(0, 5)
      .forEach((invoice) => {
        items.push({
          id: `inv-${invoice.id}`,
          icon: FiDollarSign,
          text: `Invoice ${invoice.invoiceNumber} ${
            invoice.status === "PAID" ? "paid" : "sent"
          }`,
          date: invoice.issueDate,
        });
      });
    tasks
      .filter((task) => task.dueDate)
      .slice(0, 5)
      .forEach((task) => {
        items.push({
          id: `task-${task.id}`,
          icon: FiClock,
          text: `Task \"${task.title}\" due ${formatDate(task.dueDate)}`,
          date: task.dueDate,
        });
      });
    return items
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [invoices, tasks]);

  const outstandingInvoices = useMemo(
    () =>
      invoices
        .filter((invoice) => ["SENT", "OVERDUE"].includes(invoice.status))
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3),
    [invoices],
  );

  const deliverableSegments = useMemo(() => {
    if (!deliverableProgress?.total) {
      return [];
    }
    const { total, approved, readyForReview, blocked } = deliverableProgress;
    const remaining = Math.max(total - (approved + readyForReview + blocked), 0);
    return [
      { tone: "approved", value: (approved / total) * 100 },
      { tone: "review", value: (readyForReview / total) * 100 },
      { tone: "blocked", value: (blocked / total) * 100 },
      { tone: "remaining", value: (remaining / total) * 100 },
    ].filter((segment) => segment.value > 0);
  }, [deliverableProgress]);

  const deliverableMetrics = useMemo(
    () => [
      { label: "Approved", value: deliverableProgress?.approved || 0, variant: "positive" },
      { label: "Ready for review", value: deliverableProgress?.readyForReview || 0, variant: "warning" },
      { label: "Blocked", value: deliverableProgress?.blocked || 0, variant: "negative" },
      { label: "Deferred", value: deliverableProgress?.deferred || 0, variant: "warning" },
    ],
    [deliverableProgress],
  );

  const billingSummaryVariant = useMemo(() => {
    if (!billingSummary) {
      return null;
    }
    const pendingTotal =
      (billingSummary.pendingDeliverables || 0) +
      (billingSummary.pendingChecklists || 0) +
      (billingSummary.pendingFiles || 0);
    if (billingSummary.ready) {
      return "positive";
    }
    return pendingTotal > 2 ? "negative" : "warning";
  }, [billingSummary]);

  const statCards = useMemo(() => {
    const pendingDeliverablesCount = Math.max(
      (deliverableProgress?.total || 0) - (deliverableProgress?.approved || 0),
      0,
    );
    const billingPendingCount = billingSummary
      ? (billingSummary.pendingDeliverables || 0) +
        (billingSummary.pendingChecklists || 0) +
        (billingSummary.pendingFiles || 0)
      : 0;
    return [
      {
        id: "projects",
        value: String(stats.activeProjects),
        label: "Active Projects",
        icon: FiFolder,
        iconClass: "bg-info-soft text-info",
      },
      {
        id: "balance",
        value: formatCurrency(stats.outstanding || 0),
        label: "Outstanding Balance",
        icon: FiDollarSign,
        iconClass: "bg-error-soft text-error",
      },
      {
        id: "deliverables",
        value: String(pendingDeliverablesCount),
        label: "Pending Deliverables",
        icon: FiClipboard,
        iconClass: "bg-warning-soft text-warning",
      },
      {
        id: "billing",
        value: billingSummary
          ? billingSummary.ready
            ? "Ready"
            : String(billingPendingCount)
          : stats.pendingRequests
          ? String(stats.pendingRequests)
          : String(stats.recentFiles.length),
        label: billingSummary
          ? "Billing Gate"
          : stats.pendingRequests
          ? "Requests Under Review"
          : "Recent Files",
        icon: billingSummary
          ? FiCheckCircle
          : stats.pendingRequests
          ? FiSend
          : FiFile,
        iconClass: billingSummary
          ? billingSummary.ready
            ? "bg-success-soft text-success"
            : "bg-warning-soft text-warning"
          : stats.pendingRequests
          ? "bg-status-in-progress-soft text-status-in-progress"
          : "bg-success-soft text-success",
      },
    ];
  }, [stats, deliverableProgress, billingSummary]);

  /**
   * Navigates to the intake flow for creating a new project request.
   *
   * @returns {void}
   */
  function goToNewProject() {
    router.push("/dashboard/projects/new");
  }

  function handleWorkflowEvent(payload) {
    if (!payload || payload.type !== "workflow.event") {
      return;
    }

    const { event } = payload;
    if (!event || !event.projectId) {
      return;
    }

    const relevant = projects.some((project) => project.id === event.projectId);
    if (!relevant) {
      return;
    }

    const now = Date.now();
    if (now - lastRefreshAtRef.current < 4000) {
      return;
    }

    lastRefreshAtRef.current = now;
    router.refresh();
  }

  useWorkflowEvents({ onEvent: handleWorkflowEvent });

  const clientFirstName = useMemo(
    () => getFirstName(clientProfileState?.contactName),
    [clientProfileState],
  );

  const dashboardSubtitle = useMemo(() => {
    if (selectedProject) {
      return `Project focus: ${selectedProject.name}`;
    }
    if (clientProfileState?.companyName) {
      return `${clientProfileState.companyName} overview`;
    }
    return "All projects overview";
  }, [clientProfileState, selectedProject]);

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold">
            {clientFirstName ? `Welcome back, ${clientFirstName}` : "Welcome"}
          </h1>
          <p className="text-base text-muted">{dashboardSubtitle}</p>
        </div>
        <Button variant="secondary" size="md" onClick={goToNewProject} className="rounded-xl">
          Submit Project Intake
        </Button>
      </section>

      <section
        className="flex flex-wrap gap-3"
        role="navigation"
        aria-label="Quick dashboard shortcuts"
      >
        {clientDashboardQuickActions.map((action) => {
          const Icon = QUICK_ACTION_ICON_MAP[action.icon] || FiArrowRight;
          const decodedDescription = action.description
            .replace(/&amp;/g, "&")
            .replace(/&apos;/g, "'");
          return (
            <Button
              key={action.id}
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-xl border border-border/70 bg-surface px-4 py-2 text-sm text-muted hover:border-primary/40 hover:text-primary"
              onClick={() => router.push(action.href)}
              aria-label={`${action.label}. ${decodedDescription}`}
              title={decodedDescription}
            >
              <Icon size={16} aria-hidden />
              {action.label}
            </Button>
          );
        })}
      </section>

      <section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.id} interactive className="rounded-3xl">
                <CardContent className="flex items-center justify-between gap-6 px-6 py-6">
                  <div className="space-y-1">
                    <div className="text-3xl font-semibold text-foreground">{card.value}</div>
                    <p className="text-sm text-muted">{card.label}</p>
                  </div>
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl text-lg",
                      card.iconClass,
                    )}
                  >
                    <Icon aria-hidden />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {pendingIntakes.length > 0 && (
        <section className="space-y-4" aria-label="Requests under review">
          <h2 className="font-heading text-xl font-semibold">Requests Under Review</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingIntakes.map((intake) => {
              const badgeVariant = clientIntakeStatusBadgeVariants[intake.status] || "warning";
              const submittedAt = intake.submittedAt
                ? formatDate(intake.submittedAt)
                : "Recently submitted";
              return (
                <Card key={`pending-${intake.id}`} className="rounded-3xl">
                  <CardContent className="space-y-4 px-6 py-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-heading text-lg font-semibold text-foreground">
                          {intake.projectName}
                        </h3>
                        <p className="text-sm text-muted">
                          <FiClock aria-hidden className="mr-2 inline" /> Submitted {submittedAt}
                        </p>
                      </div>
                      <Badge variant={badgeVariant}>{intakeStatusLabel(intake.status)}</Badge>
                    </div>
                    {intake.summary ? (
                      <p className="text-sm text-foreground/80">{intake.summary}</p>
                    ) : null}
                    <div className="space-y-2 text-sm text-muted">
                      {intake.budgetRange ? (
                        <p>
                          <strong className="font-semibold text-foreground">Budget:</strong> {intake.budgetRange}
                        </p>
                      ) : null}
                      {intake.targetLaunch ? (
                        <p>
                          <strong className="font-semibold text-foreground">Target launch:</strong> {intake.targetLaunch}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm text-muted">
                      <span>We&apos;ll let you know as soon as the team finishes triage.</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => router.push("/dashboard/projects?submitted=1")}
                        aria-label="Track intake status"
                      >
                        Track status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-foreground">Deliverable Progress</h2>
            <Card className="rounded-3xl">
              <CardContent className="space-y-4 px-6 py-6">
                {deliverableProgress?.total ? (
                  <>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-border/60">
                      <div className="flex h-full w-full">
                        {deliverableSegments.map((segment) => (
                          <div
                            key={segment.tone}
                            className={cn("h-full", BURNDOWN_TONE_CLASSES[segment.tone])}
                            style={{ width: `${segment.value}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {deliverableMetrics.map((metric) => (
                        <span
                          key={metric.label}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                            SUMMARY_PILL_CLASSES[metric.variant] || SUMMARY_PILL_CLASSES.warning,
                          )}
                        >
                          {metric.label}: {metric.value}
                        </span>
                      ))}
                      {billingSummary ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                            SUMMARY_PILL_CLASSES[billingSummaryVariant || "warning"],
                          )}
                        >
                          {billingSummary.ready ? "Billing ready" : billingSummary.summary}
                        </span>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted">No deliverables have been scheduled yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-foreground">Upcoming Deliverables</h2>
            <Card className="rounded-3xl">
              <CardContent className="space-y-4 px-6 py-6">
                {deliverables.length > 0 ? (
                  <ul className="space-y-4">
                    {deliverables.map((deliverable) => {
                      const badgeVariant = STATUS_BADGE_VARIANTS[deliverable.status] || "default";
                      return (
                        <li
                          key={deliverable.id}
                          className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-surface px-4 py-4"
                        >
                          <div className="space-y-2 text-sm">
                            <p className="font-semibold text-foreground">{deliverable.title}</p>
                            <div className="flex flex-wrap items-center gap-3 text-muted">
                              {deliverable.project?.name ? (
                                <span>{deliverable.project.name}</span>
                              ) : null}
                              {deliverable.dueDate ? (
                                <span className="inline-flex items-center gap-2">
                                  <FiCalendar aria-hidden />
                                  {formatDate(deliverable.dueDate)}
                                </span>
                              ) : (
                                <span>No due date</span>
                              )}
                            </div>
                            {deliverable.latestStatusNote ? (
                              <p className="text-muted">{deliverable.latestStatusNote}</p>
                            ) : null}
                          </div>
                          <Badge variant={badgeVariant} className="self-start">
                            {deliverable.status.toLowerCase().replaceAll("_", " ")}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">No pending deliverables at this time.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-foreground">Recent Activity</h2>
            <Card className="rounded-3xl">
              <CardContent className="space-y-4 px-6 py-6">
                <ul className="space-y-4">
                  {recentActivity.map((item) => (
                    <li key={item.id} className="flex items-center gap-4">
                      <Avatar size={40} className="bg-accent-soft text-info">
                        <item.icon aria-hidden size={18} />
                      </Avatar>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-foreground">{item.text}</p>
                        <p className="text-muted">{formatDate(item.date)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-foreground">Outstanding Invoices</h2>
            <Card className="rounded-3xl">
              <CardContent className="space-y-4 px-6 py-6">
                {outstandingInvoices.length > 0 ? (
                  <ul className="space-y-4">
                    {outstandingInvoices.map((invoice) => (
                      <li key={invoice.id} className="flex items-center gap-4">
                        <Badge variant={INVOICE_BADGE_VARIANTS[invoice.status] || "default"}>
                          {invoice.status.toLowerCase()}
                        </Badge>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(invoice.amount)}
                          </p>
                          <p className="text-muted">
                            Due {formatDate(invoice.dueDate)} · {invoice.project?.name || "Project"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">No invoices need your attention right now.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-foreground">Upcoming Tasks</h2>
            <Card className="rounded-3xl">
              <CardContent className="space-y-4 px-6 py-6">
                <ul className="space-y-4">
                  {tasks.slice(0, 6).map((task) => {
                    const dueStatus = getDueStatus(task.dueDate);
                    return (
                      <li key={task.id} className="flex items-center gap-4">
                        <Badge variant={dueStatus.variant}>{dueStatus.label}</Badge>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-foreground">{task.title}</p>
                          <p className="text-muted">
                            Due {task.dueDate ? formatDate(task.dueDate) : "—"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-foreground">Recent Files</h2>
            <Card className="rounded-3xl">
              <CardContent className="space-y-4 px-6 py-6">
                <ul className="space-y-4">
                  {files.slice(0, 5).map((file) => (
                    <li key={file.id} className="flex items-center gap-4">
                      <Avatar size={40} className="bg-secondary text-secondary-foreground">
                        <span>{file.fileType?.slice(0, 3)?.toUpperCase()}</span>
                      </Avatar>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-foreground">{file.fileName}</p>
                        <p className="text-muted">Uploaded {formatDate(file.uploadedAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
/** @module dashboard/DashboardPageClient */
