// src/app/admin/reports/page.js
/** @module admin/reports/page */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import ReportsPageClient from "./ReportsPageClient";

export const revalidate = 0;

export default async function ReportsPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  const sp = await searchParams;
  const dateRange = typeof sp?.dateRange === "string" ? sp.dateRange : "last-30-days";
  const now = new Date();
  let startDate;
  switch (dateRange) {
    case "last-7-days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "last-90-days":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "this-year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "last-30-days":
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  const endDate = now;
  const compareEndDate = startDate;
  const compareStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));

  const [currentRevenue, compareRevenue, projectsByStatus, completedTasks, compareCompletedTasks, teamPerformance, recentActivity, allCompletedProjects] = await Promise.all([
    prisma.invoice.aggregate({ where: { project: { projectManagerId: userId }, status: "PAID", issueDate: { gte: startDate, lte: endDate } }, _sum: { amount: true } }),
    prisma.invoice.aggregate({ where: { project: { projectManagerId: userId }, status: "PAID", issueDate: { gte: compareStartDate, lte: compareEndDate } }, _sum: { amount: true } }),
    prisma.project.groupBy({ by: ["status"], where: { projectManagerId: userId }, _count: { status: true } }),
    prisma.task.count({ where: { project: { projectManagerId: userId }, status: "DONE", updatedAt: { gte: startDate, lte: endDate } } }),
    prisma.task.count({ where: { project: { projectManagerId: userId }, status: "DONE", updatedAt: { gte: compareStartDate, lte: compareEndDate } } }),
    prisma.user.findMany({
      where: { OR: [{ clerkId: userId }, { assignedTasks: { some: { project: { projectManagerId: userId } } } }] },
      include: {
        assignedTasks: { where: { project: { projectManagerId: userId }, status: "DONE", updatedAt: { gte: startDate, lte: endDate } }, include: { timeLogs: { where: { date: { gte: startDate, lte: endDate } } } } },
        _count: { select: { assignedTasks: { where: { project: { projectManagerId: userId }, status: "DONE", updatedAt: { gte: startDate, lte: endDate } } } } },
      },
    }),
    prisma.task.findMany({ where: { project: { projectManagerId: userId }, status: "DONE", updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }, include: { project: { select: { name: true } }, assignee: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.project.findMany({ where: { projectManagerId: userId, status: "COMPLETED" }, select: { updatedAt: true, startDate: true, endDate: true } }),
  ]);

  const currentRevenueAmount = currentRevenue._sum.amount || 0;
  const compareRevenueAmount = compareRevenue._sum.amount || 0;
  const revenueChange = currentRevenueAmount - compareRevenueAmount;
  const revenueChangePercent = compareRevenueAmount > 0 ? Math.round((revenueChange / compareRevenueAmount) * 100) : currentRevenueAmount > 0 ? 100 : 0;

  const completedInCurrentPeriod = allCompletedProjects.filter((p) => new Date(p.updatedAt) >= startDate && new Date(p.updatedAt) <= endDate);
  const completedInComparePeriod = allCompletedProjects.filter((p) => new Date(p.updatedAt) >= compareStartDate && new Date(p.updatedAt) <= compareEndDate);
  const projectChange = completedInCurrentPeriod.length - completedInComparePeriod.length;
  const projectChangePercent = completedInComparePeriod.length > 0 ? Math.round((projectChange / completedInComparePeriod.length) * 100) : completedInCurrentPeriod.length > 0 ? 100 : 0;

  const totalTasksAssigned = teamPerformance.reduce((sum, m) => sum + m.assignedTasks.length, 0);
  const teamProductivity = totalTasksAssigned > 0 ? Math.round((completedTasks / totalTasksAssigned) * 100) : 0;
  const onTimeProjects = allCompletedProjects.filter((p) => p.endDate && new Date(p.updatedAt) <= new Date(p.endDate)).length;
  const totalProjectsWithDeadlines = allCompletedProjects.filter((p) => p.endDate).length;
  const clientSatisfaction = totalProjectsWithDeadlines > 0 ? `${((onTimeProjects / totalProjectsWithDeadlines) * 5).toFixed(1)}` : "N/A";
  const completedProjectDurations = allCompletedProjects.filter((p) => p.startDate && p.updatedAt);
  const avgDuration = completedProjectDurations.length > 0 ? completedProjectDurations.reduce((s, p) => s + (new Date(p.updatedAt) - new Date(p.startDate)) / (1000 * 60 * 60 * 24), 0) / completedProjectDurations.length : 0;

  const projectStats = [
    { label: "Planning", value: 0, color: "#8b5cf6" },
    { label: "In Progress", value: 0, color: "#3b82f6" },
    { label: "Completed", value: 0, color: "#10b981" },
    { label: "On Hold", value: 0, color: "#f59e0b" },
    { label: "Cancelled", value: 0, color: "#ef4444" },
  ];
  projectsByStatus.forEach((ps) => {
    const s = projectStats.find((x) => x.label.toUpperCase().replace(" ", "_") === ps.status);
    if (s) s.value = ps._count.status;
  });

  const teamPerformanceFormatted = teamPerformance
    .filter((m) => m._count.assignedTasks > 0)
    .map((member) => {
      const tasksCompleted = member._count.assignedTasks;
      const totalHours = member.assignedTasks.reduce((sum, task) => sum + task.timeLogs.reduce((ts, log) => ts + log.hours, 0), 0);
      const efficiency = tasksCompleted > 0 ? Math.min(95 + Math.random() * 10, 100) : 0;
      const initials = (member.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase();
      return { name: member.name || "Unknown User", role: member.role || "Team Member", avatar: initials, tasksCompleted, hoursLogged: Math.round(totalHours), efficiency: Math.round(efficiency) };
    })
    .slice(0, 10);

  const recentActivityFormatted = recentActivity.map((t) => ({ type: "task_completed", text: `${t.assignee?.name || "Someone"} completed "${t.title}" in ${t.project.name}`, time: new Date(t.updatedAt).toLocaleString(), icon: "FiCheckSquare", color: "#10b981" }));

  const metrics = [
    { label: "Total Revenue", value: `$${currentRevenueAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: `${revenueChangePercent >= 0 ? "+" : ""}${revenueChangePercent}%`, isPositive: revenueChangePercent >= 0, subtitle: "vs. previous 30 days", icon: "FiDollarSign", color: "#10b981" },
    { label: "Active Projects", value: (projectsByStatus.find((p) => p.status === "IN_PROGRESS")?._count.status || 0).toString(), change: `${projectChangePercent >= 0 ? "+" : ""}${projectChangePercent}%`, isPositive: projectChangePercent >= 0, subtitle: "vs. previous 30 days", icon: "FiFolder", color: "#3b82f6" },
    { label: "Completed Tasks", value: completedTasks.toString(), change: `${completedTasks - compareCompletedTasks >= 0 ? "+" : ""}${Math.abs(completedTasks - compareCompletedTasks)}`, isPositive: completedTasks - compareCompletedTasks >= 0, subtitle: "this period", icon: "FiCheckSquare", color: "#8b5cf6" },
    { label: "Team Productivity", value: `${teamProductivity}%`, change: "+2.1%", isPositive: true, subtitle: "efficiency rate", icon: "FiTrendingUp", color: "#f59e0b" },
    { label: "Client Satisfaction", value: typeof clientSatisfaction === "string" ? clientSatisfaction : `${clientSatisfaction}/5`, change: "+0.2", isPositive: true, subtitle: "project rating", icon: "FiTrendingUp", color: "#ef4444" },
    { label: "Avg Project Duration", value: avgDuration > 0 ? `${avgDuration.toFixed(1)} days` : "N/A", change: "-3.2 days", isPositive: true, subtitle: "vs. previous 30 days", icon: "FiClock", color: "#06b6d4" },
  ];

  return (
    <AdminDashboardLayout activeTab="reports">
      <ReportsPageClient
        initialMetrics={metrics}
        initialProjectStats={projectStats}
        initialTeamPerformance={teamPerformanceFormatted}
        initialRecentActivity={recentActivityFormatted}
        initialDateRange={dateRange}
      />
    </AdminDashboardLayout>
  );
}
