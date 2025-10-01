// src/app/api/tasks/stats/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskData = await Promise.all([
      // Total tasks user has access to
      prisma.task.count({
        where: {
          OR: [
            { assigneeId: userId },
            {
              project: {
                projectManagerId: userId,
              },
            },
          ],
        },
      }),

      // Tasks by status
      prisma.task.groupBy({
        by: ["status"],
        where: {
          OR: [
            { assigneeId: userId },
            {
              project: {
                projectManagerId: userId,
              },
            },
          ],
        },
        _count: {
          status: true,
        },
      }),

      // Tasks by priority
      prisma.task.groupBy({
        by: ["priority"],
        where: {
          OR: [
            { assigneeId: userId },
            {
              project: {
                projectManagerId: userId,
              },
            },
          ],
        },
        _count: {
          priority: true,
        },
      }),

      // Overdue tasks
      prisma.task.count({
        where: {
          OR: [
            { assigneeId: userId },
            {
              project: {
                projectManagerId: userId,
              },
            },
          ],
          dueDate: { lt: today },
          status: {
            notIn: ["DONE", "CLIENT_APPROVED"],
          },
        },
      }),

      // Tasks completed this week
      prisma.task.count({
        where: {
          OR: [
            { assigneeId: userId },
            {
              project: {
                projectManagerId: userId,
              },
            },
          ],
          status: "DONE",
          updatedAt: { gte: startOfWeek },
        },
      }),

      // Tasks completed this month
      prisma.task.count({
        where: {
          OR: [
            { assigneeId: userId },
            {
              project: {
                projectManagerId: userId,
              },
            },
          ],
          status: "DONE",
          updatedAt: { gte: startOfMonth },
        },
      }),

      // Tasks assigned to current user
      prisma.task.count({
        where: { assigneeId: userId },
      }),

      // Total hours logged by user
      prisma.timeLog.aggregate({
        where: { userId },
        _sum: { hours: true },
      }),
    ]);

    const [
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
      myAssignedTasks,
      totalHoursLogged,
    ] = taskData;

    // Format status counts
    const statusCounts = {
      BACKLOG: 0,
      IN_PROGRESS: 0,
      BLOCKED: 0,
      READY_FOR_REVIEW: 0,
      CLIENT_APPROVED: 0,
      DONE: 0,
    };

    tasksByStatus.forEach((item) => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status] = item._count.status;
      }
    });

    // Format priority counts
    const priorityCounts = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    tasksByPriority.forEach((item) => {
      priorityCounts[item.priority] = item._count.priority;
    });

    const stats = {
      totalTasks,
      tasksByStatus: statusCounts,
      tasksByPriority: priorityCounts,
      overdueTasks,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
      myAssignedTasks,
      totalHoursLogged: totalHoursLogged._sum.hours || 0,
      completionRate:
        totalTasks > 0
          ? Math.round(((statusCounts.DONE + statusCounts.CLIENT_APPROVED) / totalTasks) * 100)
          : 0,
      readyForReview: statusCounts.READY_FOR_REVIEW,
      blocked: statusCounts.BLOCKED,
      clientApproved: statusCounts.CLIENT_APPROVED,
      activeTasks: statusCounts.IN_PROGRESS + statusCounts.BLOCKED + statusCounts.READY_FOR_REVIEW,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch task statistics" },
      { status: 500 }
    );
  }
}
