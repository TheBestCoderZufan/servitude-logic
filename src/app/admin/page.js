// src/app/admin/page.js
/** @module admin/page */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import AdminPageClient from "./AdminPageClient";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { evaluateBillingReadiness } from "@/lib/workflows/billingReadiness";

export const revalidate = 0;

function timeAgo(date) {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInHours < 1) {
    const mins = Math.floor(diffInMs / (1000 * 60));
    return mins <= 1 ? "Just now" : `${mins} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  // Date boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Queries (mostly scoped to current PM)
  const [
    totalProjects,
    projectsThisMonth,
    projectsLastMonth,
    recentProjects,
    activeClients,
    clientsThisMonth,
    clientsLastMonth,
    pendingTasks,
    tasksToday,
    tasksCompletedToday,
    monthlyRevenueAgg,
    lastMonthRevenueAgg,
    deliverableTasks,
    billingProjects,
  ] = await Promise.all([
    prisma.project.count({ where: { projectManagerId: userId } }),
    prisma.project.count({
      where: { projectManagerId: userId, createdAt: { gte: startOfMonth } },
    }),
    prisma.project.count({
      where: {
        projectManagerId: userId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.project.findMany({
      where: { projectManagerId: userId },
      include: {
        client: { select: { id: true, companyName: true, contactName: true } },
        tasks: { select: { id: true, status: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.client.count({
      where: {
        projects: {
          some: {
            projectManagerId: userId,
            status: { in: ["PLANNING", "IN_PROGRESS"] },
          },
        },
      },
    }),
    prisma.client.count({
      where: {
        createdAt: { gte: startOfMonth },
        projects: { some: { projectManagerId: userId } },
      },
    }),
    prisma.client.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        projects: { some: { projectManagerId: userId } },
      },
    }),
    prisma.task.count({
      where: {
        OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }],
        status: {
          in: ["BACKLOG", "IN_PROGRESS", "BLOCKED", "READY_FOR_REVIEW"],
        },
      },
    }),
    prisma.task.count({
      where: {
        OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }],
        createdAt: { gte: startOfDay },
      },
    }),
    prisma.task.count({
      where: {
        OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }],
        status: "DONE",
        updatedAt: { gte: startOfDay },
      },
    }),
    prisma.invoice.aggregate({
      where: {
        project: { projectManagerId: userId },
        status: "PAID",
        issueDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        project: { projectManagerId: userId },
        status: "PAID",
        issueDate: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),
    prisma.task.findMany({
      where: {
        project: { projectManagerId: userId },
        isDeliverable: true,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: { select: { companyName: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    }),
    prisma.project.findMany({
      where: { projectManagerId: userId },
      select: {
        id: true,
        name: true,
        client: { select: { companyName: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const currentRevenue = monthlyRevenueAgg._sum.amount || 0;
  const previousRevenue = lastMonthRevenueAgg._sum.amount || 0;
  const revenueChange = currentRevenue - previousRevenue;
  const revenueChangePercent =
    previousRevenue > 0
      ? Math.round((revenueChange / previousRevenue) * 100)
      : currentRevenue > 0
      ? 100
      : 0;

  const deliverableProgress = {
    total: deliverableTasks.length,
    approved: 0,
    readyForReview: 0,
    blocked: 0,
    inProgress: 0,
    backlog: 0,
    deferred: 0,
  };

  const STATUS_TO_PROGRESS_KEY = {
    CLIENT_APPROVED: "approved",
    READY_FOR_REVIEW: "readyForReview",
    BLOCKED: "blocked",
    IN_PROGRESS: "inProgress",
    BACKLOG: "backlog",
    DONE: "inProgress",
  };

  deliverableTasks.forEach((task) => {
    const key = STATUS_TO_PROGRESS_KEY[task.status] || "inProgress";
    deliverableProgress[key] = (deliverableProgress[key] || 0) + 1;
    const hasDeferment = task.statusHistory?.some(
      (entry) => entry.context === "BILLING_DEFERMENT",
    );
    if (hasDeferment) {
      deliverableProgress.deferred += 1;
    }
  });

  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcomingDeliverables = deliverableTasks
    .filter((task) => {
      if (!task.dueDate) {
        return task.status === "READY_FOR_REVIEW";
      }
      const dueDate = new Date(task.dueDate);
      return dueDate <= twoWeeksFromNow;
    })
    .map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      project: { name: task.project?.name || "" },
      latestStatusNote: task.statusHistory?.[0]?.note || null,
    }))
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 8);

  const billingReadinessResults = await Promise.all(
    billingProjects.map((project) => evaluateBillingReadiness({ projectId: project.id })),
  );

  const billingSummaries = billingProjects.map((project, index) => {
    const readiness = billingReadinessResults[index];
    const pendingDeliverablesCount = readiness.deliverables.filter(
      (deliverable) => !deliverable.isApproved && !deliverable.hasDeferment,
    ).length;
    return {
      projectId: project.id,
      projectName: project.name,
      clientName: project.client?.companyName || "",
      ready: readiness.ready,
      summary: readiness.summary,
      pendingDeliverables: pendingDeliverablesCount,
      pendingChecklists: readiness.pendingChecklists.length,
      pendingFiles: readiness.pendingFiles.length,
    };
  });

  // Upcoming tasks (next 7 days or null due date)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [
    upcomingTasks,
    readyForReviewTasks,
    blockedTasks,
    completedTasks,
    updatedProjects,
    assignedTasks,
    sentInvoices,
  ] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }],
        status: {
          in: ["BACKLOG", "IN_PROGRESS", "BLOCKED", "READY_FOR_REVIEW"],
        },
        OR: [{ dueDate: { lte: nextWeek } }, { dueDate: null }],
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { clerkId: true, name: true, email: true } },
      },
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        project: { projectManagerId: userId },
        status: "READY_FOR_REVIEW",
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { clerkId: true, name: true, email: true } },
      },
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { updatedAt: "desc" },
      ],
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        project: { projectManagerId: userId },
        status: "BLOCKED",
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { clerkId: true, name: true, email: true } },
      },
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { updatedAt: "desc" },
      ],
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }],
        status: "DONE",
        updatedAt: { gte: sevenDaysAgo },
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.project.findMany({
      where: { projectManagerId: userId, updatedAt: { gte: sevenDaysAgo } },
      include: { client: { select: { companyName: true } } },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.task.findMany({
      where: { assigneeId: userId, createdAt: { gte: sevenDaysAgo } },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.invoice.findMany({
      where: {
        project: { projectManagerId: userId },
        status: { in: ["SENT", "PAID"] },
        issueDate: { gte: sevenDaysAgo },
      },
      include: {
        project: { include: { client: { select: { companyName: true } } } },
      },
      orderBy: { issueDate: "desc" },
      take: 3,
    }),
  ]);

  const dependencyAlerts = blockedTasks
    .filter((task) => {
      if (!task.dueDate) return true;
      const diffDays = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    })
    .map((task) => ({
      id: task.id,
      title: task.title,
      project: task.project?.name,
      assignee: task.assignee?.name || "Unassigned",
      dueDate: task.dueDate,
    }));

  const stats = {
    totalProjects,
    projectsChange: projectsThisMonth - projectsLastMonth,
    activeClients,
    clientsChange: clientsThisMonth - clientsLastMonth,
    pendingTasks,
    tasksChange: tasksToday - tasksCompletedToday,
    monthlyRevenue: currentRevenue,
    revenueChange,
    revenueChangePercent,
    readyForReview: readyForReviewTasks.length,
    blocked: blockedTasks.length,
  };

  const recentActivity = [
    ...completedTasks.map((task) => ({
      id: `task-${task.id}`,
      type: "task_completed",
      description: `${task.assignee?.name || "Someone"} completed "${
        task.title
      }" in ${task.project.name}`,
      date: task.updatedAt,
      timeAgo: timeAgo(task.updatedAt),
    })),
    ...updatedProjects.map((p) => ({
      id: `project-${p.id}`,
      type: "project_updated",
      description: `Project "${p.name}" for ${p.client.companyName} was updated`,
      date: p.updatedAt,
      timeAgo: timeAgo(p.updatedAt),
    })),
    ...assignedTasks.map((t) => ({
      id: `assignment-${t.id}`,
      type: "task_assigned",
      description: `You were assigned to task "${t.title}" in ${t.project.name}`,
      date: t.createdAt,
      timeAgo: timeAgo(t.createdAt),
    })),
    ...sentInvoices.map((inv) => ({
      id: `invoice-${inv.id}`,
      type: "invoice_sent",
      description: `Invoice ${inv.invoiceNumber} sent to ${inv.project.client.companyName}`,
      date: inv.issueDate,
      timeAgo: timeAgo(inv.issueDate),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <AdminDashboardLayout activeTab="dashboard">
      <AdminPageClient
        initialStats={stats}
        initialRecentProjects={recentProjects}
        initialUpcomingTasks={upcomingTasks}
        initialRecentActivity={recentActivity}
        initialReadyForReview={readyForReviewTasks}
        initialBlockedTasks={blockedTasks}
        initialDependencyAlerts={dependencyAlerts}
        initialDeliverableProgress={deliverableProgress}
        initialUpcomingDeliverables={upcomingDeliverables}
        initialBillingSummaries={billingSummaries}
      />
    </AdminDashboardLayout>
  );
}
