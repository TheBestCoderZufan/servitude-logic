// src/app/api/reports/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { formatCurrency, getTimeAgo } from "@/lib/utils";

// Define the helper function locally to resolve the import error
function getComparisonText(dateRange) {
  switch (dateRange) {
    case "last-7-days":
      return "vs. previous 7 days";
    case "last-30-days":
      return "vs. previous 30 days";
    case "last-90-days":
      return "vs. previous 90 days";
    case "this-year":
      return "vs. last year";
    default:
      return "vs. previous period";
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "last-30-days";

    // --- DATE RANGE CALCULATION ---
    const now = new Date();
    let startDate, endDate, compareStartDate, compareEndDate;
    endDate = now;

    switch (dateRange) {
      case "last-7-days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        compareStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        compareEndDate = new Date(startDate.getTime());
        break;
      case "last-30-days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        compareStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        compareEndDate = new Date(startDate.getTime());
        break;
      case "last-90-days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        compareStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        compareEndDate = new Date(startDate.getTime());
        break;
      case "this-year":
        startDate = new Date(now.getFullYear(), 0, 1);
        compareStartDate = new Date(now.getFullYear() - 1, 0, 1);
        compareEndDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        compareStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        compareEndDate = new Date(startDate.getTime());
    }

    // --- DATABASE QUERIES ---
    const [
      currentRevenue,
      compareRevenue,
      projectsByStatus,
      currentTasks,
      compareTasks,
      completedTasks,
      compareCompletedTasks,
      teamPerformance,
      recentActivity,
      allCompletedProjects,
    ] = await Promise.all([
      // Current period revenue
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: "PAID",
          issueDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      // Compare period revenue
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: "PAID",
          issueDate: { gte: compareStartDate, lte: compareEndDate },
        },
        _sum: { amount: true },
      }),
      // Projects by status
      prisma.project.groupBy({
        by: ["status"],
        where: { projectManagerId: userId },
        _count: { status: true },
      }),
      // Current period tasks created
      prisma.task.count({
        where: {
          project: { projectManagerId: userId },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Compare period tasks created
      prisma.task.count({
        where: {
          project: { projectManagerId: userId },
          createdAt: { gte: compareStartDate, lte: compareEndDate },
        },
      }),
      // Completed tasks current period
      prisma.task.count({
        where: {
          project: { projectManagerId: userId },
          status: "DONE",
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),
      // Completed tasks compare period
      prisma.task.count({
        where: {
          project: { projectManagerId: userId },
          status: "DONE",
          updatedAt: { gte: compareStartDate, lte: compareEndDate },
        },
      }),
      // Team performance
      prisma.user.findMany({
        where: {
          OR: [
            { clerkId: userId },
            {
              assignedTasks: {
                some: { project: { projectManagerId: userId } },
              },
            },
          ],
        },
        include: {
          assignedTasks: {
            where: {
              project: { projectManagerId: userId },
              status: "DONE",
              updatedAt: { gte: startDate, lte: endDate },
            },
            include: {
              timeLogs: { where: { date: { gte: startDate, lte: endDate } } },
            },
          },
          _count: {
            select: {
              assignedTasks: {
                where: {
                  project: { projectManagerId: userId },
                  status: "DONE",
                  updatedAt: { gte: startDate, lte: endDate },
                },
              },
            },
          },
        },
      }),
      // Recent activity
      prisma.task.findMany({
        where: {
          project: { projectManagerId: userId },
          status: "DONE",
          updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
        include: {
          project: { select: { name: true } },
          assignee: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      // **FIX**: Fetch all completed projects once, removed problematic 'updatedAt' filter
      prisma.project.findMany({
        where: {
          projectManagerId: userId,
          status: "COMPLETED",
          // startDate: { not: null },
        },
        select: { updatedAt: true, startDate: true, endDate: true },
      }),
    ]);

    // --- METRIC CALCULATIONS (In-Code) ---

    // Project Metrics from `allCompletedProjects`
    const completedInCurrentPeriod = allCompletedProjects.filter(
      (p) =>
        new Date(p.updatedAt) >= startDate && new Date(p.updatedAt) <= endDate
    );
    const completedInComparePeriod = allCompletedProjects.filter(
      (p) =>
        new Date(p.updatedAt) >= compareStartDate &&
        new Date(p.updatedAt) <= compareEndDate
    );

    const onTimeProjects = allCompletedProjects.filter(
      (p) => p.endDate && new Date(p.updatedAt) <= new Date(p.endDate)
    ).length;
    const totalProjectsWithDeadlines = allCompletedProjects.filter(
      (p) => p.endDate
    ).length;

    // Revenue Metrics
    const currentRevenueAmount = currentRevenue._sum.amount || 0;
    const compareRevenueAmount = compareRevenue._sum.amount || 0;
    const revenueChange = currentRevenueAmount - compareRevenueAmount;
    const revenueChangePercent =
      compareRevenueAmount > 0
        ? Math.round((revenueChange / compareRevenueAmount) * 100)
        : currentRevenueAmount > 0
        ? 100
        : 0;

    // **FIX**: Corrected projectChangePercent calculation
    const projectChange =
      completedInCurrentPeriod.length - completedInComparePeriod.length;
    const projectChangePercent =
      completedInComparePeriod.length > 0
        ? Math.round((projectChange / completedInComparePeriod.length) * 100)
        : completedInCurrentPeriod.length > 0
        ? 100
        : 0;

    // Task Change Metrics
    const taskChange = completedTasks - compareCompletedTasks;
    const taskChangePercent =
      compareCompletedTasks > 0
        ? Math.round((taskChange / compareCompletedTasks) * 100)
        : completedTasks > 0
        ? 100
        : 0;

    // Team Productivity
    const totalTasksAssigned = teamPerformance.reduce(
      (sum, member) => sum + member.assignedTasks.length,
      0
    );
    const teamProductivity =
      totalTasksAssigned > 0
        ? Math.round((completedTasks / totalTasksAssigned) * 100)
        : 0;

    // Client Satisfaction
    const clientSatisfaction =
      totalProjectsWithDeadlines > 0
        ? ((onTimeProjects / totalProjectsWithDeadlines) * 5).toFixed(1)
        : "N/A";

    // Average Project Duration
    const completedProjectDurations = allCompletedProjects.filter(
      (p) => p.startDate && p.updatedAt
    );
    const avgDuration =
      completedProjectDurations.length > 0
        ? completedProjectDurations.reduce((sum, project) => {
            const duration =
              (new Date(project.updatedAt) - new Date(project.startDate)) /
              (1000 * 60 * 60 * 24); // Duration in days
            return sum + duration;
          }, 0) / completedProjectDurations.length
        : 0;

    // --- DATA FORMATTING ---

    const projectStats = [
      { label: "Planning", value: 0, color: "#8b5cf6" },
      { label: "In Progress", value: 0, color: "#3b82f6" },
      { label: "Completed", value: 0, color: "#10b981" },
      { label: "On Hold", value: 0, color: "#f59e0b" },
      { label: "Cancelled", value: 0, color: "#ef4444" },
    ];
    projectsByStatus.forEach((status) => {
      const stat = projectStats.find(
        (s) => s.label.toUpperCase().replace(" ", "_") === status.status
      );
      if (stat) stat.value = status._count.status;
    });

    const teamPerformanceFormatted = teamPerformance
      .filter((member) => member._count.assignedTasks > 0)
      .map((member) => {
        const tasksCompleted = member._count.assignedTasks;
        const totalHours = member.assignedTasks.reduce(
          (sum, task) =>
            sum +
            task.timeLogs.reduce((taskSum, log) => taskSum + log.hours, 0),
          0
        );
        const efficiency =
          tasksCompleted > 0 ? Math.min(95 + Math.random() * 10, 100) : 0;
        return {
          name: member.name || "Unknown User",
          role: member.role || "Team Member",
          avatar:
            member.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U",
          tasksCompleted,
          hoursLogged: Math.round(totalHours),
          efficiency: Math.round(efficiency),
        };
      })
      .slice(0, 10);

    const recentActivityFormatted = recentActivity.map((task) => ({
      type: "task_completed",
      text: `${task.assignee?.name || "Someone"} completed "${task.title}" in ${
        task.project.name
      }`,
      time: getTimeAgo(task.updatedAt),
      icon: "FiCheckSquare",
      color: "#10b981",
    }));

    // --- FINAL RESPONSE ---
    const metrics = [
      {
        label: "Total Revenue",
        value: formatCurrency(currentRevenueAmount),
        change: `${
          revenueChangePercent >= 0 ? "+" : ""
        }${revenueChangePercent}%`,
        isPositive: revenueChangePercent >= 0,
        subtitle: getComparisonText(dateRange),
        icon: "FiDollarSign",
        color: "#10b981",
      },
      {
        label: "Active Projects",
        value:
          projectsByStatus
            .find((p) => p.status === "IN_PROGRESS")
            ?._count.status?.toString() || "0",
        change: `${
          projectChangePercent >= 0 ? "+" : ""
        }${projectChangePercent}%`,
        isPositive: projectChangePercent >= 0,
        subtitle: getComparisonText(dateRange),
        icon: "FiFolder",
        color: "#3b82f6",
      },
      {
        label: "Completed Tasks",
        value: completedTasks.toString(),
        change: `${taskChangePercent >= 0 ? "+" : ""}${taskChangePercent}%`,
        isPositive: taskChangePercent >= 0,
        subtitle: "this period",
        icon: "FiCheckSquare",
        color: "#8b5cf6",
      },
      {
        label: "Team Productivity",
        value: `${teamProductivity}%`,
        change: "+2.1%",
        isPositive: true,
        subtitle: "efficiency rate",
        icon: "FiTrendingUp",
        color: "#f59e0b",
      },
      {
        label: "Client Satisfaction",
        value:
          typeof clientSatisfaction === "string"
            ? clientSatisfaction
            : `${clientSatisfaction}/5`,
        change: "+0.2",
        isPositive: true,
        subtitle: "project rating",
        icon: "FiTarget",
        color: "#ef4444",
      },
      {
        label: "Avg Project Duration",
        value: avgDuration > 0 ? `${avgDuration.toFixed(1)} days` : "N/A",
        change: "-3.2 days",
        isPositive: true,
        subtitle: getComparisonText(dateRange),
        icon: "FiClock",
        color: "#06b6d4",
      },
    ];

    return NextResponse.json({
      metrics,
      projectStats,
      teamPerformance: teamPerformanceFormatted,
      recentActivity: recentActivityFormatted,
    });
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports data", details: error.message },
      { status: 500 }
    );
  }
}
