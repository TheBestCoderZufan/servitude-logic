// src/app/dashboard/DashboardPageClient.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, Button, Badge, Avatar } from "@/components/ui";
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
import { useProject } from "@/providers/ProjectProvider";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useWorkflowEvents } from "@/hooks/useWorkflowEvents";
import { intakeStatusLabel } from "@/data/page/admin/intake/intakeData";
import { clientIntakeStatusBadgeVariants } from "@/data/page/dashboard/projectsClient.data";
import { clientDashboardQuickActions } from "@/data/page/dashboard/clientDashboardPage.data";

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
 * Badge variants aligned to invoice status codes for the quick invoice list.
 * @type {Record<string, string>}
 */
const INVOICE_BADGE_VARIANTS = {
  OVERDUE: "error",
  SENT: "warning",
  PAID: "success",
  DRAFT: "default",
};
/**
 * Maps quick action icon identifiers to react-icons components.
 * @type {Record<string, function(): JSX.Element>}
 */
const quickActionIconMap = {
  FiFolder,
  FiDollarSign,
  FiMessageSquare,
};

/**
 * Extracts the first name from a contact string for friendlier greetings.
 *
 * @param {string|null|undefined} contactName - Full contact name captured for the client.
 * @returns {string|null} First name when available.
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
 * Derives a due-date status indicator for task summaries.
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
import {
  PageHeader,
  TitleGroup,
  PageTitle,
  PageSubtitle,
  StatsGrid,
  StatCard,
  StatRow,
  StatValue,
  StatLabel,
  StatIcon,
  QuickActions,
  ActionButton,
  Grid,
  SectionTitle,
  List,
  ListItem,
  ItemMeta,
  BurndownWrapper,
  BurndownBar,
  BurndownSegment,
  SummaryPill,
  DeliverableList,
  DeliverableItem,
  DeliverableDetails,
  PendingRequestsGrid,
  PendingRequestCard,
  PendingRequestHeader,
  PendingRequestTitle,
  PendingRequestMeta,
  PendingRequestFooter,
} from "./style";

/**
 * Dashboard client island that renders the dashboard UI using SSR-provided data.
 *
 * @param {Object} props - Component props.
 * @param {Array} props.initialProjects - Initial project list (scoped by server).
 * @param {Array} props.initialInvoices - Initial invoice list (scoped by server).
 * @param {Array} props.initialTasks - Initial task list (scoped by server).
 * @param {Array} props.initialFiles - Initial recent files list (scoped by server).
 * @param {Array} props.initialPendingIntakes - Pending intake submissions awaiting triage.
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
      ["PLANNING", "IN_PROGRESS"].includes(project.status)
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
        (invoice) => ["SENT", "PAID"].includes(invoice.status) && within7d(invoice.issueDate)
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
          text: `Task "${task.title}" due ${formatDate(task.dueDate)}`,
          date: task.dueDate,
        });
      });
    return items
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [invoices, tasks]);

  const outstandingInvoices = useMemo(() =>
    invoices
      .filter((invoice) => ["SENT", "OVERDUE"].includes(invoice.status))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3),
  [invoices]);

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

  /**
   * Navigates the client to the intake flow for submitting a new project request.
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
    <div>
      <PageHeader>
        <TitleGroup>
          <PageTitle>
            {clientFirstName ? `Welcome back, ${clientFirstName}` : "Welcome"}
          </PageTitle>
          <PageSubtitle>{dashboardSubtitle}</PageSubtitle>
        </TitleGroup>
        <Button $variant="outline" onClick={goToNewProject}>
          Submit Project Intake
        </Button>
      </PageHeader>

      <QuickActions role="navigation" aria-label="Quick dashboard shortcuts">
        {clientDashboardQuickActions.map((action) => {
          const Icon = quickActionIconMap[action.icon] || FiArrowRight;
          const decodedDescription = action.description
            .replace(/&amp;/g, "&")
            .replace(/&apos;/g, "'");
          return (
            <ActionButton
              key={action.id}
              type="button"
              size="sm"
              $variant="outline"
              onClick={() => router.push(action.href)}
              aria-label={`${action.label}. ${decodedDescription}`}
              title={decodedDescription}
            >
              <Icon size={16} />
              {action.label}
            </ActionButton>
          );
        })}
      </QuickActions>

      <StatsGrid>
        <StatCard>
          <CardContent>
            <StatRow>
              <div>
                <StatValue>{stats.activeProjects}</StatValue>
                <StatLabel>Active Projects</StatLabel>
              </div>
              <StatIcon color="#3b82f6">
                <FiFolder />
              </StatIcon>
            </StatRow>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <StatRow>
              <div>
                <StatValue>{formatCurrency(stats.outstanding || 0)}</StatValue>
                <StatLabel>Outstanding Balance</StatLabel>
              </div>
              <StatIcon color="#ef4444">
                <FiDollarSign />
              </StatIcon>
            </StatRow>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <StatRow>
              <div>
                <StatValue>
                  {Math.max(
                    (deliverableProgress?.total || 0) - (deliverableProgress?.approved || 0),
                    0,
                  )}
                </StatValue>
                <StatLabel>Pending Deliverables</StatLabel>
              </div>
              <StatIcon color="#f59e0b">
                <FiClipboard />
              </StatIcon>
            </StatRow>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <StatRow>
              <div>
                <StatValue>
                  {billingSummary
                    ? billingSummary.ready
                      ? "Ready"
                      : (billingSummary.pendingDeliverables || 0) +
                        (billingSummary.pendingChecklists || 0) +
                        (billingSummary.pendingFiles || 0)
                    : stats.pendingRequests || stats.recentFiles.length}
                </StatValue>
                <StatLabel>
                  {billingSummary
                    ? "Billing Gate"
                    : stats.pendingRequests
                    ? "Requests Under Review"
                    : "Recent Files"}
                </StatLabel>
              </div>
              <StatIcon
                color={billingSummary
                  ? billingSummary.ready
                    ? "#10b981"
                    : "#f97316"
                  : stats.pendingRequests
                  ? "#6366f1"
                  : "#10b981"}
              >
                {billingSummary ? (
                  <FiCheckCircle />
                ) : stats.pendingRequests ? (
                  <FiSend />
                ) : (
                  <FiFile />
                )}
              </StatIcon>
            </StatRow>
          </CardContent>
        </StatCard>
      </StatsGrid>

      {pendingIntakes.length > 0 && (
        <section aria-label="Requests under review">
          <SectionTitle>Requests Under Review</SectionTitle>
          <PendingRequestsGrid>
            {pendingIntakes.map((intake) => {
              const badgeVariant =
                clientIntakeStatusBadgeVariants[intake.status] || "warning";
              const submittedAt = intake.submittedAt
                ? formatDate(intake.submittedAt)
                : "Recently submitted";
              return (
                <PendingRequestCard key={`pending-${intake.id}`}>
                    <PendingRequestHeader>
                      <PendingRequestTitle>{intake.projectName}</PendingRequestTitle>
                      <Badge variant={badgeVariant}>
                        {intakeStatusLabel(intake.status)}
                      </Badge>
                    </PendingRequestHeader>
                  <PendingRequestMeta>
                    <span>
                      <FiClock size={14} style={{ marginRight: 6 }} /> Submitted {submittedAt}
                    </span>
                    {intake.summary ? <span>{intake.summary}</span> : null}
                    {intake.budgetRange ? (
                      <span>
                        <strong>Budget:</strong> {intake.budgetRange}
                      </span>
                    ) : null}
                    {intake.targetLaunch ? (
                      <span>
                        <strong>Target launch:</strong> {intake.targetLaunch}
                      </span>
                    ) : null}
                  </PendingRequestMeta>
                  <PendingRequestFooter>
                    <span>
                      We&apos;ll let you know as soon as the team finishes triage.
                    </span>
                    <Button
                      size="sm"
                      $variant="ghost"
                      onClick={() => router.push("/dashboard/projects?submitted=1")}
                      aria-label="Track intake status"
                    >
                      Track status
                    </Button>
                  </PendingRequestFooter>
                </PendingRequestCard>
              );
            })}
          </PendingRequestsGrid>
        </section>
      )}

      <Grid>
        <div>
          <SectionTitle>Deliverable Progress</SectionTitle>
          <Card>
            <CardContent>
              {deliverableProgress?.total ? (
                <BurndownWrapper>
                  <BurndownBar>
                    {deliverableSegments.map((segment) => (
                      <BurndownSegment
                        key={segment.tone}
                        $tone={segment.tone}
                        $width={segment.value}
                      />
                    ))}
                  </BurndownBar>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {deliverableMetrics.map((metric) => (
                      <SummaryPill key={metric.label} $variant={metric.variant}>
                        {metric.label}: {metric.value}
                      </SummaryPill>
                    ))}
                    {billingSummary && (
                      <SummaryPill $variant={billingSummaryVariant || "warning"}>
                        {billingSummary.ready ? "Billing ready" : billingSummary.summary}
                      </SummaryPill>
                    )}
                  </div>
                </BurndownWrapper>
              ) : (
                <p style={{ color: "#64748b" }}>No deliverables have been scheduled yet.</p>
              )}
            </CardContent>
          </Card>

          <SectionTitle>Upcoming Deliverables</SectionTitle>
          <Card>
            <CardContent>
              {deliverables.length > 0 ? (
                <DeliverableList>
                  {deliverables.map((deliverable) => {
                    const badgeVariant =
                      STATUS_BADGE_VARIANTS[deliverable.status] || "default";
                    return (
                      <DeliverableItem key={deliverable.id}>
                        <DeliverableDetails>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>
                            {deliverable.title}
                          </div>
                          <div>
                            {deliverable.project?.name && (
                              <span style={{ marginRight: 12 }}>
                                {deliverable.project.name}
                              </span>
                            )}
                            {deliverable.dueDate ? (
                              <span>
                                <FiCalendar size={14} style={{ marginRight: 6 }} />
                                {formatDate(deliverable.dueDate)}
                              </span>
                            ) : (
                              <span>No due date</span>
                            )}
                          </div>
                          {deliverable.latestStatusNote && (
                            <span style={{ color: "#64748b" }}>
                              {deliverable.latestStatusNote}
                            </span>
                          )}
                        </DeliverableDetails>
                        <Badge variant={badgeVariant}>
                          {deliverable.status.toLowerCase().replaceAll("_", " ")}
                        </Badge>
                      </DeliverableItem>
                    );
                  })}
                </DeliverableList>
              ) : (
                <p style={{ color: "#64748b" }}>No pending deliverables at this time.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <SectionTitle>Recent Activity</SectionTitle>
          <Card>
            <CardContent>
              <List>
                {recentActivity.map((item) => (
                  <ListItem key={item.id}>
                    <ItemMeta>
                      <Avatar>
                        <item.icon size={18} />
                      </Avatar>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.text}</div>
                        <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
                          {formatDate(item.date)}
                        </div>
                      </div>
                    </ItemMeta>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <SectionTitle>Outstanding Invoices</SectionTitle>
          <Card>
            <CardContent>
              {outstandingInvoices.length > 0 ? (
                <List>
                  {outstandingInvoices.map((invoice) => (
                    <ListItem key={invoice.id}>
                      <ItemMeta>
                        <Badge variant={INVOICE_BADGE_VARIANTS[invoice.status] || "default"}>
                          {invoice.status.toLowerCase()}
                        </Badge>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {formatCurrency(invoice.amount)}
                          </div>
                          <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
                            Due {formatDate(invoice.dueDate)} · {invoice.project?.name || "Project"}
                          </div>
                        </div>
                      </ItemMeta>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  No invoices need your attention right now.
                </div>
              )}
            </CardContent>
          </Card>

          <SectionTitle>Upcoming Tasks</SectionTitle>
          <Card>
            <CardContent>
              <List>
                {tasks.slice(0, 6).map((task) => {
                  const dueStatus = getDueStatus(task.dueDate);
                  return (
                    <ListItem key={task.id}>
                      <ItemMeta>
                        <Badge variant={dueStatus.variant}>{dueStatus.label}</Badge>
                        <div>
                          <div style={{ fontWeight: 600 }}>{task.title}</div>
                          <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
                            Due {task.dueDate ? formatDate(task.dueDate) : "—"}
                          </div>
                        </div>
                      </ItemMeta>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>

          <SectionTitle>Recent Files</SectionTitle>
          <Card>
            <CardContent>
              <List>
                {files.slice(0, 5).map((file) => (
                  <ListItem key={file.id}>
                    <ItemMeta>
                      <Avatar>
                        <span>{file.fileType?.slice(0, 3)?.toUpperCase()}</span>
                      </Avatar>
                      <div>
                        <div style={{ fontWeight: 600 }}>{file.fileName}</div>
                        <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
                          Uploaded {formatDate(file.uploadedAt)}
                        </div>
                      </div>
                    </ItemMeta>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </div>
      </Grid>
    </div>
  );
}
/** @module dashboard/DashboardPageClient */
