// src/app/api/dashboard/activity/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit")) || 10;

    if (userIdParam !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get recent activities from various sources
    const activities = [];

    // Recent completed tasks
    const completedTasks = await prisma.task.findMany({
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
          gte: sevenDaysAgo,
        },
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        assignee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    completedTasks.forEach((task) => {
      activities.push({
        id: `task-${task.id}`,
        type: "task_completed",
        description: `${task.assignee?.name || "Someone"} completed "${
          task.title
        }" in ${task.project.name}`,
        date: task.updatedAt,
        timeAgo: getTimeAgo(task.updatedAt),
      });
    });

    // Recent project updates
    const updatedProjects = await prisma.project.findMany({
      where: {
        projectManagerId: userId,
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
    });

    updatedProjects.forEach((project) => {
      activities.push({
        id: `project-${project.id}`,
        type: "project_updated",
        description: `Project "${project.name}" for ${project.client.companyName} was updated`,
        date: project.updatedAt,
        timeAgo: getTimeAgo(project.updatedAt),
      });
    });

    // Recent task assignments
    const assignedTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    assignedTasks.forEach((task) => {
      activities.push({
        id: `assignment-${task.id}`,
        type: "task_assigned",
        description: `You were assigned to task "${task.title}" in ${task.project.name}`,
        date: task.createdAt,
        timeAgo: getTimeAgo(task.createdAt),
      });
    });

    // Recent sent invoices
    const sentInvoices = await prisma.invoice.findMany({
      where: {
        project: {
          projectManagerId: userId,
        },
        status: {
          in: ["SENT", "PAID"],
        },
        issueDate: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
      take: 3,
    });

    sentInvoices.forEach((invoice) => {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: "invoice_sent",
        description: `Invoice ${invoice.invoiceNumber} sent to ${invoice.project.client.companyName}`,
        date: invoice.issueDate,
        timeAgo: getTimeAgo(invoice.issueDate),
      });
    });

    // Sort all activities by date and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}
