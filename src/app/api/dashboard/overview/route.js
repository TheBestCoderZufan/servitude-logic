// src/app/api/dashboard/overview/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    if (userIdParam !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // This endpoint could combine all the above queries for better performance
    // if you want to fetch all dashboard data in a single request

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run all queries in parallel
    const [
      totalProjects,
      projectsThisMonth,
      projectsLastMonth,
      recentProjects,
      activeClients,
      pendingTasks,
      upcomingTasks,
      readyForReviewTasks,
      blockedTasks,
      monthlyRevenue,
      lastMonthRevenue,
      completedTasks,
    ] = await Promise.all([
      // Total projects
      prisma.project.count({
        where: { projectManagerId: userId },
      }),

      // Projects this month
      prisma.project.count({
        where: {
          projectManagerId: userId,
          createdAt: { gte: startOfMonth },
        },
      }),

      // Projects last month
      prisma.project.count({
        where: {
          projectManagerId: userId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Recent projects
      prisma.project.findMany({
        where: { projectManagerId: userId },
        include: {
          client: {
            select: { id: true, companyName: true, contactName: true },
          },
          tasks: { select: { id: true, status: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),

      // Active clients
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

      // Pending tasks
      prisma.task.count({
        where: {
          OR: [
            { assigneeId: userId },
            { project: { projectManagerId: userId } },
          ],
          status: {
            in: ["BACKLOG", "IN_PROGRESS", "BLOCKED", "READY_FOR_REVIEW"],
          },
        },
      }),

      // Upcoming tasks
      prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: userId },
            { project: { projectManagerId: userId } },
          ],
          status: {
            in: ["BACKLOG", "IN_PROGRESS", "BLOCKED", "READY_FOR_REVIEW"],
          },
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

      // Tasks ready for client review
      prisma.task.findMany({
        where: {
          project: { projectManagerId: userId },
          status: "READY_FOR_REVIEW",
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { name: true } },
        },
        orderBy: [
          { dueDate: { sort: "asc", nulls: "last" } },
          { updatedAt: "desc" },
        ],
        take: 6,
      }),

      // Blocked tasks highlighting dependency issues
      prisma.task.findMany({
        where: {
          project: { projectManagerId: userId },
          status: "BLOCKED",
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { name: true } },
        },
        orderBy: [
          { dueDate: { sort: "asc", nulls: "last" } },
          { updatedAt: "desc" },
        ],
        take: 6,
      }),

      // Monthly revenue
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: "PAID",
          issueDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),

      // Last month revenue
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: "PAID",
          issueDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),

      // Recent completed tasks for activity
      prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: userId },
            { project: { projectManagerId: userId } },
          ],
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
    ]);

    // Calculate stats
    const currentRevenue = monthlyRevenue._sum.amount || 0;
    const previousRevenue = lastMonthRevenue._sum.amount || 0;
    const revenueChange = currentRevenue - previousRevenue;
    const revenueChangePercent =
      previousRevenue > 0
        ? Math.round((revenueChange / previousRevenue) * 100)
        : currentRevenue > 0
        ? 100
        : 0;

    // Prepare activity feed
    const activities = completedTasks.map((task) => ({
      id: `task-${task.id}`,
      type: "task_completed",
      description: `${task.assignee?.name || "Someone"} completed "${
        task.title
      }" in ${task.project.name}`,
      date: task.updatedAt,
      timeAgo: getTimeAgo(task.updatedAt),
    }));

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

    const response = {
      stats: {
        totalProjects,
        projectsChange: projectsThisMonth - projectsLastMonth,
        activeClients,
        clientsChange: 0, // Would need additional queries for this
        pendingTasks,
        tasksChange: 0, // Would need additional queries for this
        monthlyRevenue: currentRevenue,
        revenueChange,
        revenueChangePercent,
      },
      recentProjects,
      upcomingTasks,
      readyForReviewTasks,
      blockedTasks,
      dependencyAlerts,
      recentActivity: activities,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard overview" },
      { status: 500 }
    );
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}
