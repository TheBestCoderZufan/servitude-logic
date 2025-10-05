// src/app/api/dashboard/stats/route.js
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

    // Verify the user is requesting their own data or has appropriate permissions
    if (userIdParam !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Get total projects count
    const totalProjects = await prisma.project.count({
      where: {
        projectManagerId: userId,
      },
    });

    // Get projects created this month
    const projectsThisMonth = await prisma.project.count({
      where: {
        projectManagerId: userId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get projects created last month
    const projectsLastMonth = await prisma.project.count({
      where: {
        projectManagerId: userId,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Get total clients linked to this project manager
    const totalClientSignups = await prisma.client.count({
      where: {
        projects: {
          some: {
            projectManagerId: userId,
          },
        },
      },
    });

    // Get active clients count (clients with active projects)
    const activeClients = await prisma.client.count({
      where: {
        projects: {
          some: {
            projectManagerId: userId,
            status: {
              in: ["PLANNING", "IN_PROGRESS"],
            },
          },
        },
      },
    });

    // Get clients from this month
    const clientsThisMonth = await prisma.client.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        projects: {
          some: {
            projectManagerId: userId,
          },
        },
      },
    });

    // Get clients from last month
    const clientsLastMonth = await prisma.client.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        projects: {
          some: {
            projectManagerId: userId,
          },
        },
      },
    });

    // Get pending tasks count
    const pendingTasks = await prisma.task.count({
      where: {
        OR: [
          { assigneeId: userId },
          {
            project: {
              projectManagerId: userId,
            },
          },
        ],
        status: {
          in: ["TODO", "IN_PROGRESS", "BACKLOG"],
        },
      },
    });

    // Get tasks created today
    const tasksToday = await prisma.task.count({
      where: {
        OR: [
          { assigneeId: userId },
          {
            project: {
              projectManagerId: userId,
            },
          },
        ],
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    // Get tasks completed today
    const tasksCompletedToday = await prisma.task.count({
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
        updatedAt: {
          gte: startOfDay,
        },
      },
    });

    // Get monthly revenue from paid invoices
    const monthlyRevenue = await prisma.invoice.aggregate({
      where: {
        project: {
          projectManagerId: userId,
        },
        status: "PAID",
        issueDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get last month's revenue
    const lastMonthRevenue = await prisma.invoice.aggregate({
      where: {
        project: {
          projectManagerId: userId,
        },
        status: "PAID",
        issueDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentRevenue = monthlyRevenue._sum.amount || 0;
    const previousRevenue = lastMonthRevenue._sum.amount || 0;
    const revenueChange = currentRevenue - previousRevenue;
    const revenueChangePercent =
      previousRevenue > 0
        ? Math.round((revenueChange / previousRevenue) * 100)
        : currentRevenue > 0
        ? 100
        : 0;

    const stats = {
      totalProjects,
      projectsChange: projectsThisMonth - projectsLastMonth,
      activeClients,
      totalClientSignups,
      clientSignupsThisMonth: clientsThisMonth,
      clientSignupsChange: clientsThisMonth - clientsLastMonth,
      clientsChange: clientsThisMonth - clientsLastMonth,
      pendingTasks,
      tasksChange: tasksToday - tasksCompletedToday,
      monthlyRevenue: currentRevenue,
      revenueChange,
      revenueChangePercent,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
