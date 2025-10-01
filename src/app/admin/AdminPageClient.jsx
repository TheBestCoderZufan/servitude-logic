// src/app/admin/AdminPageClient.jsx
/** @module admin/AdminPageClient */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DashboardGrid,
  StatsInfo,
  StatsValue,
  StatsLabel,
  StatsChange,
  StatsIcon,
  ContentGrid,
  RecentSection,
  QuickActions,
  QuickActionIcon,
  QuickActionInfo,
  QuickActionTitle,
  QuickActionDescription,
  ProjectItem,
  ProjectInfo,
  ProjectName,
  ProjectClient,
  ProjectProgress,
  ProgressText,
  TaskItem,
  TaskInfo,
  TaskTitle,
  TaskMeta,
  ActivityFeed,
  ActivityItem,
  ActivityIcon,
  ActivityContent,
  ActivityText,
  ActivityTime,
  HeaderActions,
  PageTitle,
  PageDescription,
  StatsCard,
  StatsCardContent,
  QuickActionCard,
  QuickActionContent,
  BurndownWrapper,
  BurndownBar,
  BurndownSegment,
  SummaryPill,
  DeliverableList,
  DeliverableItem,
  DeliverableTitle,
  DeliverableMetaRow,
  MetricsGrid,
} from "./style";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Avatar,
  ProgressBar,
  ProgressFill,
  StatusDot,
  EmptyState,
  HelperText,
} from "@/components/ui";
import {
  FiTrendingUp,
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiDollarSign,
  FiArrowRight,
  FiBarChart,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
} from "react-icons/fi";
import { useToastNotifications } from "@/components/ui/Toast";
import { useWorkflowEvents } from "@/hooks/useWorkflowEvents";
import { useRouter } from "next/navigation";
import { quickActions, getActivityIcon, getActivityColor } from "@/data/page/admin/adminData";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";

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
  IN_PROGRESS: "inProgress",
  BLOCKED: "error",
  READY_FOR_REVIEW: "warning",
  CLIENT_APPROVED: "success",
  DONE: "completed",
};

/**
 * Admin dashboard client island. Receives initial SSR data and preserves
 * interactivity and refresh via API endpoints.
 *
 * @param {Object} props
 * @param {Object} props.initialStats
 * @param {Array<Object>} props.initialRecentProjects
 * @param {Array<Object>} props.initialUpcomingTasks
 * @param {Array<Object>} props.initialRecentActivity
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
  const [billingSummaries, setBillingSummaries] = useState(
    initialBillingSummaries || [],
  );
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

  const dependencyAlertIds = useMemo(
    () => new Set((dependencyAlerts || []).map((alert) => alert.id)),
    [dependencyAlerts],
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

  const billingReadyCount = useMemo(
    () => billingSummaries.filter((summary) => summary.ready).length,
    [billingSummaries],
  );

  const upcomingDeliverables = useMemo(
    () => upcomingDeliverableList.slice(0, 5),
    [upcomingDeliverableList],
  );

  const deliverableMetrics = useMemo(
    () => [
      { label: "Approved", value: deliverableProgress?.approved || 0, variant: "positive" },
      { label: "Ready for review", value: deliverableProgress?.readyForReview || 0, variant: "warning" },
      { label: "Blocked", value: deliverableProgress?.blocked || 0, variant: "negative" },
      { label: "Deferred", value: deliverableProgress?.deferred || 0, variant: "warning" },
    ],
    [deliverableProgress],
  );

  // Optional: client-side refresh on demand (button could be added later)
  async function fetchDashboardStats() {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats`);
      if (res.ok) setStats(await res.json());
    } catch (e) {
      notifyError("Failed to load dashboard statistics");
    } finally {
      setStatsLoading(false);
    }
  }
  async function fetchRecentProjects(limit = 3) {
    setProjectsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/projects?limit=${limit}`);
      if (res.ok) setRecentProjects(await res.json());
    } catch (e) {
      // silent
    } finally {
      setProjectsLoading(false);
    }
  }
  async function fetchUpcomingTasks(limit = 5) {
    setTasksLoading(true);
    try {
      const res = await fetch(`/api/dashboard/tasks?limit=${limit}`);
      if (res.ok) setUpcomingTasks(await res.json());
    } catch (e) {
      // silent
    } finally {
      setTasksLoading(false);
    }
  }
  async function fetchRecentActivity(limit = 5) {
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/dashboard/activity?limit=${limit}`);
      if (res.ok) setRecentActivity(await res.json());
    } catch (e) {
      // silent
    } finally {
      setActivityLoading(false);
    }
  }

  function calculateProjectProgress(project) {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  }

  function handleWorkflowEvent(payload) {
    if (!payload || payload.type !== "workflow.event") {
      return;
    }

    const { event } = payload;
    if (!event || !event.entity) {
      return;
    }

    const refreshableEntities = ["intake", "proposal", "project", "invoice", "task"];
    if (!refreshableEntities.includes(event.entity)) {
      return;
    }

    const now = Date.now();
    if (now - lastRefreshAtRef.current < 3000) {
      return;
    }

    lastRefreshAtRef.current = now;

    router.refresh();
  }

  useWorkflowEvents({ onEvent: handleWorkflowEvent });

  return (
      <div>
        <HeaderActions>
          <div style={{ flex: 1 }}>
            <PageTitle>Admin Dashboard</PageTitle>
            <PageDescription>
              Welcome back! Here&apos;s what&apos;s happening with your projects today.
            </PageDescription>
          </div>
          <Button>
            <FiBarChart />
            View Reports
          </Button>
        </HeaderActions>

        {statsLoading ? (
          <EmptyState />
        ) : stats ? (
          <DashboardGrid>
            <StatsCard>
              <StatsCardContent>
                <StatsInfo>
                  <StatsValue>{stats.totalProjects}</StatsValue>
                  <StatsLabel>Total Projects</StatsLabel>
                  <StatsChange $ispositive={stats.projectsChange >= 0}>
                    <FiTrendingUp size={16} />
                    {stats.projectsChange >= 0 ? "+" : ""}
                    {stats.projectsChange} this month
                  </StatsChange>
                </StatsInfo>
                <StatsIcon color="#3b82f6">
                  <FiFolder />
                </StatsIcon>
              </StatsCardContent>
            </StatsCard>

            <StatsCard>
              <StatsCardContent>
                <StatsInfo>
                  <StatsValue>{stats.activeClients}</StatsValue>
                  <StatsLabel>Active Clients</StatsLabel>
                  <StatsChange $ispositive={stats.clientsChange >= 0}>
                    <FiTrendingUp size={16} />
                    {stats.clientsChange >= 0 ? "+" : ""}
                    {stats.clientsChange} this month
                  </StatsChange>
                </StatsInfo>
                <StatsIcon color="#10b981">
                  <FiUsers />
                </StatsIcon>
              </StatsCardContent>
            </StatsCard>

            <StatsCard>
              <StatsCardContent>
                <StatsInfo>
                  <StatsValue>{stats.pendingTasks}</StatsValue>
                  <StatsLabel>Pending Tasks</StatsLabel>
                  <StatsChange $ispositive={stats.tasksChange <= 0}>
                    <FiTrendingUp size={16} />
                    {stats.tasksChange >= 0 ? "+" : ""}
                    {stats.tasksChange} today
                  </StatsChange>
                </StatsInfo>
                <StatsIcon color="#f59e0b">
                  <FiCheckSquare />
                </StatsIcon>
              </StatsCardContent>
            </StatsCard>

            <StatsCard>
              <StatsCardContent>
                <StatsInfo>
                  <StatsValue>{formatCurrency(stats.monthlyRevenue)}</StatsValue>
                  <StatsLabel>Revenue (MTD)</StatsLabel>
                  <StatsChange $ispositive={stats.revenueChange >= 0}>
                    <FiTrendingUp size={16} />
                    {stats.revenueChangePercent >= 0 ? "+" : ""}
                    {stats.revenueChangePercent}% vs last month
                  </StatsChange>
                </StatsInfo>
                <StatsIcon color="#ef4444">
                  <FiDollarSign />
                </StatsIcon>
              </StatsCardContent>
            </StatsCard>

            <StatsCard>
              <StatsCardContent>
                <StatsInfo>
                  <StatsValue>
                    {deliverableProgress?.total
                      ? `${deliverableProgress.approved}/${deliverableProgress.total}`
                      : "0/0"}
                  </StatsValue>
                  <StatsLabel>Deliverables Approved</StatsLabel>
                  <StatsChange $ispositive={deliverableProgress?.total === deliverableProgress?.approved}>
                    {Math.max(
                      (deliverableProgress?.total || 0) - (deliverableProgress?.approved || 0),
                      0,
                    )} remaining
                  </StatsChange>
                </StatsInfo>
                <StatsIcon color="#10b981">
                  <FiCheckCircle />
                </StatsIcon>
              </StatsCardContent>
            </StatsCard>

            <StatsCard>
              <StatsCardContent>
                <StatsInfo>
                  <StatsValue>
                    {billingSummaries.length
                      ? `${billingReadyCount}/${billingSummaries.length}`
                      : "0/0"}
                  </StatsValue>
                  <StatsLabel>Projects Billing Ready</StatsLabel>
                  <StatsChange $ispositive={billingReadyCount === billingSummaries.length}>
                    {billingSummaries.length - billingReadyCount} gating
                  </StatsChange>
                </StatsInfo>
                <StatsIcon color="#f97316">
                  <FiClipboard />
                </StatsIcon>
              </StatsCardContent>
            </StatsCard>
          </DashboardGrid>
        ) : (
          <EmptyState />
        )}

        <ContentGrid>
          <RecentSection>
            <Card>
              <CardHeader>
                <CardTitle>Milestone Burndown</CardTitle>
                <CardDescription>Track deliverable progress toward billing readiness</CardDescription>
              </CardHeader>
              <CardContent>
                {deliverableProgress?.total ? (
                  <BurndownWrapper>
                    <BurndownBar>
                      {deliverableSegments.map((segment) => (
                        <BurndownSegment
                          key={segment.tone}
                          $tone={segment.tone}
                          $width={segment.value}
                          aria-label={`${segment.tone} segment`}
                        />
                      ))}
                    </BurndownBar>
                    <MetricsGrid>
                      {deliverableMetrics.map((metric) => (
                        <SummaryPill key={metric.label} $variant={metric.variant}>
                          {metric.label}: {metric.value}
                        </SummaryPill>
                      ))}
                    </MetricsGrid>
                  </BurndownWrapper>
                ) : (
                  <HelperText>No deliverables have been flagged yet.</HelperText>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Keep track of your active projects and their progress</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">View All<FiArrowRight /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} style={{ height: 80, backgroundColor: "#f1f5f9", borderRadius: 8, animation: "pulse 2s infinite" }} />
                    ))}
                  </div>
                ) : recentProjects.length > 0 ? (
                  recentProjects.map((project) => {
                    const progress = calculateProjectProgress(project);
                    return (
                      <ProjectItem key={project.id}>
                        <Avatar size="40">{getInitials(project.client?.companyName)}</Avatar>
                        <ProjectInfo>
                          <ProjectName>{project.name}</ProjectName>
                          <ProjectClient>{project.client?.companyName}</ProjectClient>
                          <ProjectProgress>
                            <ProgressBar style={{ width: "120px" }}>
                              <ProgressFill progress={progress} />
                            </ProgressBar>
                            <ProgressText>{progress}% complete</ProgressText>
                          </ProjectProgress>
                        </ProjectInfo>
                        <StatusDot status={project.status} />
                      </ProjectItem>
                    );
                  })
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>

            <Card style={{ marginTop: 24 }}>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Here&apos;s what&apos;s coming up next</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ height: 60, backgroundColor: "#f1f5f9", borderRadius: 8, animation: "pulse 2s infinite" }} />
                    ))}
                  </div>
                ) : upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <TaskItem key={task.id}>
                      <TaskInfo>
                        <TaskTitle>{task.title}</TaskTitle>
                        <TaskMeta>
                          <Badge variant="secondary">{task.project?.name || "Unassigned"}</Badge>
                          {task.dueDate && (
                            <Badge variant="outline">{new Date(task.dueDate).toLocaleDateString()}</Badge>
                          )}
                        </TaskMeta>
                      </TaskInfo>
                      <Badge variant="secondary">{(task.priority || "").toLowerCase()}</Badge>
                    </TaskItem>
                  ))
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>

            <Card style={{ marginTop: 24 }}>
              <CardHeader>
                <CardTitle>Upcoming Deliverables</CardTitle>
                <CardDescription>Deadlines and statuses for client-facing work</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingDeliverables.length > 0 ? (
                  <DeliverableList>
                    {upcomingDeliverables.map((deliverable) => {
                      const badgeVariant =
                        STATUS_BADGE_VARIANTS[deliverable.status] || "default";
                      return (
                        <DeliverableItem key={deliverable.id}>
                          <div>
                            <DeliverableTitle>{deliverable.title}</DeliverableTitle>
                            <DeliverableMetaRow>
                              <Badge variant="secondary">
                                {deliverable.project?.name || "Unassigned"}
                              </Badge>
                              {deliverable.dueDate ? (
                                <Badge variant="outline">
                                  <FiCalendar size={14} style={{ marginRight: 6 }} />
                                  {formatDate(deliverable.dueDate)}
                                </Badge>
                              ) : (
                                <Badge variant="outline">No due date</Badge>
                              )}
                              {deliverable.latestStatusNote && (
                                <span style={{ color: "#64748b" }}>
                                  {deliverable.latestStatusNote}
                                </span>
                              )}
                            </DeliverableMetaRow>
                          </div>
                          <Badge variant={badgeVariant}>
                            {deliverable.status.toLowerCase().replaceAll("_", " ")}
                          </Badge>
                        </DeliverableItem>
                      );
                    })}
                  </DeliverableList>
                ) : (
                  <HelperText>No upcoming deliverables scheduled.</HelperText>
                )}
              </CardContent>
            </Card>
          </RecentSection>

          <div>
            <Card style={{ marginBottom: 24 }}>
              <CardHeader>
                <CardTitle>Delivery Risks</CardTitle>
                <CardDescription>Monitor blocked work and approaching deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                {blockedTasks.length === 0 ? (
                  <HelperText>No blockers at the moment.</HelperText>
                ) : (
                  blockedTasks.map((task) => (
                    <TaskItem key={task.id}>
                      <TaskInfo>
                        <TaskTitle>{task.title}</TaskTitle>
                        <TaskMeta>
                          <Badge variant="error">{task.project?.name || "Unassigned"}</Badge>
                          {task.dueDate && (
                            <Badge variant={dependencyAlertIds.has(task.id) ? "warning" : "secondary"}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </TaskMeta>
                      </TaskInfo>
                      <Badge variant={dependencyAlertIds.has(task.id) ? "warning" : "error"}>
                        {dependencyAlertIds.has(task.id) ? "Due soon" : "Blocked"}
                      </Badge>
                    </TaskItem>
                  ))
                )}
                {dependencyAlerts.length > 0 && (
                  <HelperText style={{ marginTop: "1rem" }}>
                    {dependencyAlerts.length} blocked task{dependencyAlerts.length === 1 ? "" : "s"} need attention within the next week.
                  </HelperText>
                )}
              </CardContent>
            </Card>

            <Card style={{ marginBottom: 24 }}>
              <CardHeader>
                <CardTitle>Billing Readiness</CardTitle>
                <CardDescription>Ensure deliverables and files are cleared before invoicing</CardDescription>
              </CardHeader>
              <CardContent>
                {billingSummaries.length > 0 ? (
                  <DeliverableList>
                    {billingSummaries.map((summary) => {
                      const pendingTotal =
                        (summary.pendingDeliverables || 0) +
                        (summary.pendingChecklists || 0) +
                        (summary.pendingFiles || 0);
                      const variant = summary.ready
                        ? "positive"
                        : pendingTotal > 2
                        ? "negative"
                        : "warning";
                      return (
                        <DeliverableItem key={summary.projectId}>
                          <div>
                            <DeliverableTitle>{summary.projectName}</DeliverableTitle>
                            <DeliverableMetaRow>
                              <Badge variant="secondary">{summary.clientName}</Badge>
                              <span style={{ color: "#64748b" }}>
                                {summary.summary}
                              </span>
                            </DeliverableMetaRow>
                          </div>
                          <SummaryPill $variant={variant}>
                            {summary.ready ? "Ready" : `${pendingTotal} gating`}
                          </SummaryPill>
                        </DeliverableItem>
                      );
                    })}
                  </DeliverableList>
                ) : (
                  <HelperText>No projects awaiting billing review.</HelperText>
                )}
              </CardContent>
            </Card>

            <Card style={{ marginBottom: 24 }}>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to help you stay productive</CardDescription>
              </CardHeader>
              <CardContent>
                <QuickActions>
                  {quickActions.map((action, index) => (
                    <QuickActionCard key={index} onClick={() => (window.location.href = action.href)}>
                      <QuickActionContent>
                        <QuickActionIcon color={action.color}>
                          <action.icon />
                        </QuickActionIcon>
                        <QuickActionInfo>
                          <QuickActionTitle>{action.title}</QuickActionTitle>
                          <QuickActionDescription>{action.description}</QuickActionDescription>
                        </QuickActionInfo>
                        <FiArrowRight />
                      </QuickActionContent>
                    </QuickActionCard>
                  ))}
                </QuickActions>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your team and projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed>
                  {activityLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ height: 50, backgroundColor: "#f1f5f9", borderRadius: 8, animation: "pulse 2s infinite" }} />
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity) => {
                      const IconComponent = getActivityIcon[activity.type] || getActivityIcon["default"];
                      return (
                        <ActivityItem key={activity.id}>
                          <ActivityIcon color={getActivityColor[activity.type] || getActivityColor["default"]}>
                            <IconComponent />
                          </ActivityIcon>
                          <ActivityContent>
                            <ActivityText>{activity.description}</ActivityText>
                            <ActivityTime>{activity.timeAgo}</ActivityTime>
                          </ActivityContent>
                        </ActivityItem>
                      );
                    })
                  ) : (
                    <EmptyState />
                  )}
                </ActivityFeed>
              </CardContent>
            </Card>
          </div>
        </ContentGrid>
      </div>
  );
}
