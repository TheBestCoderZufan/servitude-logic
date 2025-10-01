// src/app/api/projects/stats/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getUserRole, isClientRole } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const role = await getUserRole(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalProjects,
      projectsByStatus,
      projectsThisMonth,
      projectsLastMonth,
      overdueProjects,
      totalRevenue,
      averageProjectDuration,
    ] = await Promise.all([
      // Total projects
      prisma.project.count({
        where:
          isClientRole(role)
            ? { client: { userId } }
            : scope === "all" || role === "ADMIN"
            ? {}
            : { projectManagerId: userId },
      }),

      // Projects by status
      prisma.project.groupBy({
        by: ["status"],
        where:
          isClientRole(role)
            ? { client: { userId } }
            : scope === "all" || role === "ADMIN"
            ? {}
            : { projectManagerId: userId },
        _count: {
          status: true,
        },
      }),

      // Projects created this month
      prisma.project.count({
        where: {
          ...(isClientRole(role)
            ? { client: { userId } }
            : scope === "all" || role === "ADMIN"
            ? {}
            : { projectManagerId: userId }),
          createdAt: { gte: startOfMonth },
        },
      }),

      // Projects created last month
      prisma.project.count({
        where: {
          ...(isClientRole(role)
            ? { client: { userId } }
            : scope === "all" || role === "ADMIN"
            ? {}
            : { projectManagerId: userId }),
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Overdue projects
      prisma.project.count({
        where: {
          ...(isClientRole(role)
            ? { client: { userId } }
            : scope === "all" || role === "ADMIN"
            ? {}
            : { projectManagerId: userId }),
          endDate: { lt: now },
          status: { not: "COMPLETED" },
        },
      }),

      // Total revenue from all projects
      prisma.invoice.aggregate({
        where: {
          project: {
            ...(isClientRole(role)
              ? { client: { userId } }
              : scope === "all" || role === "ADMIN"
              ? {}
              : { projectManagerId: userId }),
          },
          status: "PAID",
        },
        _sum: { amount: true },
      }),

      // Average project duration (completed projects only)
      prisma.project.findMany({
        where: {
          ...(isClientRole(role)
            ? { client: { userId } }
            : scope === "all" || role === "ADMIN"
            ? {}
            : { projectManagerId: userId }),
          status: "COMPLETED",
        },
        select: {
          startDate: true,
          endDate: true,
        },
      }),
    ]);

    // Calculate average duration
    let avgDuration = 0;
    if (averageProjectDuration.length > 0) {
      const totalDays = averageProjectDuration.reduce((sum, project) => {
        const duration = Math.ceil(
          (new Date(project.endDate) - new Date(project.startDate)) /
            (1000 * 60 * 60 * 24)
        );
        return sum + duration;
      }, 0);
      avgDuration = Math.round(totalDays / averageProjectDuration.length);
    }

    // Format status counts
    const statusCounts = {
      PLANNING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      ON_HOLD: 0,
      CANCELLED: 0,
    };

    projectsByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });

    const stats = {
      totalProjects,
      projectsByStatus: statusCounts,
      newProjectsThisMonth: projectsThisMonth,
      projectGrowth: projectsThisMonth - projectsLastMonth,
      overdueProjects,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageProjectDuration: avgDuration,
      activeProjects: statusCounts.PLANNING + statusCounts.IN_PROGRESS,
      completionRate:
        totalProjects > 0
          ? Math.round((statusCounts.COMPLETED / totalProjects) * 100)
          : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching project stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch project statistics" },
      { status: 500 }
    );
  }
}
