// src/app/api/tasks/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  handleApiError,
  validateRequiredFields,
  getPaginationParams,
  buildSortObject,
  getUserRole,
  isClientRole,
} from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";
import {
  normalizeTransitionNote,
  statusRequiresNote,
} from "@/lib/tasks/taskWorkflow";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = await getUserRole(userId);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const sortObject = buildSortObject(searchParams);

    // Search and filter parameters
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const assigneeId = searchParams.get("assigneeId");
    const dueDate = searchParams.get("dueDate"); // 'overdue', 'today', 'week', 'month'

    // Build where clause
    const whereClause = {
      OR: [
        // Staff access: assigned tasks or tasks in projects they manage
        { assigneeId: userId },
        { project: { projectManagerId: userId } },
        // Client access: tasks in projects for their client account
        ...(isClientRole(role) ? [{ project: { client: { userId: userId } } }] : []),
      ],
    };

    // Add search filters
    if (search) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          {
            project: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        ],
      });
    }

    if (status && status !== "all") {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({ status: status.toUpperCase() });
    }

    if (priority && priority !== "all") {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({ priority: priority.toUpperCase() });
    }

    if (projectId) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({ projectId });
    }

    if (assigneeId) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({ assigneeId });
    }

    // Due date filters
    if (dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      whereClause.AND = whereClause.AND || [];

      switch (dueDate) {
        case "overdue":
          whereClause.AND.push({
            dueDate: { lt: today },
            status: { not: "DONE" },
          });
          break;
        case "today":
          whereClause.AND.push({
            dueDate: { gte: today, lt: tomorrow },
          });
          break;
        case "week":
          whereClause.AND.push({
            dueDate: { gte: today, lte: weekFromNow },
          });
          break;
        case "month":
          whereClause.AND.push({
            dueDate: { gte: today, lte: monthFromNow },
          });
          break;
      }
    }

    // Get tasks with full details
    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
              client: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
          assignee: {
            select: {
              clerkId: true,
              name: true,
              email: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  clerkId: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 3, // Latest 3 comments for preview
          },
          timeLogs: {
            include: {
              user: {
                select: {
                  clerkId: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { date: "desc" },
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              comments: true,
              timeLogs: true,
            },
          },
        },
        orderBy: [
          { status: "asc" },
          { priority: "desc" },
          { dueDate: { sort: "asc", nulls: "last" } },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.task.count({ where: whereClause }),
    ]);

    // Calculate additional stats for each task
    const tasksWithStats = tasks.map((task) => {
      const totalHours = task.timeLogs.reduce((sum, log) => sum + log.hours, 0);
      const isOverdue =
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        !["DONE", "CLIENT_APPROVED"].includes(task.status);

      let dueDateStatus = "normal";
      if (task.dueDate) {
        const now = new Date();
        const due = new Date(task.dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0 && !["DONE", "CLIENT_APPROVED"].includes(task.status)) {
          dueDateStatus = "overdue";
        } else if (diffDays === 0) {
          dueDateStatus = "due-today";
        } else if (diffDays <= 3) {
          dueDateStatus = "due-soon";
        }
      }

      return {
        ...task,
        totalHours,
        isOverdue,
        dueDateStatus,
        daysUntilDue: task.dueDate
          ? Math.ceil(
              (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
            )
          : null,
        latestStatusNote: task.statusHistory?.[0]?.note || null,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      tasks: tasksWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json(
        { error: "Forbidden: clients cannot create tasks" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, ["title", "projectId"]);

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: body.projectId,
        projectManagerId: userId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Validate assignee if provided
    if (body.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { clerkId: body.assigneeId },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: "Assignee not found" },
          { status: 404 }
        );
      }
    }

    // Validate due date
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (dueDate && dueDate < new Date()) {
      return NextResponse.json(
        { error: "Due date cannot be in the past" },
        { status: 400 }
      );
    }

    const allowedStatuses = new Set([
      "BACKLOG",
      "IN_PROGRESS",
      "BLOCKED",
      "READY_FOR_REVIEW",
      "CLIENT_APPROVED",
      "DONE",
    ]);
    const requestedStatus = body.status?.toUpperCase();
    const normalizedStatus = allowedStatuses.has(requestedStatus)
      ? requestedStatus
      : "BACKLOG";

    if (statusRequiresNote(normalizedStatus) && !(body.transitionNote && body.transitionNote.trim().length > 0)) {
      return NextResponse.json(
        {
          error: `A transition note is required when creating a task in ${normalizedStatus.replaceAll("_", " ")}.`,
        },
        { status: 400 },
      );
    }

    const statusHistoryCreates = [
      {
        toStatus: normalizedStatus,
        note: normalizeTransitionNote(
          body.transitionNote,
          normalizedStatus === "BACKLOG"
            ? "Task created"
            : `Task created in ${normalizedStatus.replaceAll("_", " ")}`,
        ),
        actorId: userId,
      },
    ];

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: normalizedStatus,
        priority: body.priority?.toUpperCase() || "MEDIUM",
        dueDate: dueDate,
        projectId: body.projectId,
        assigneeId: body.assigneeId || null,
        isDeliverable: Boolean(body.isDeliverable),
        deliverableKey: body.deliverableKey || null,
        statusHistory: {
          create: statusHistoryCreates,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            client: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        assignee: {
          select: {
            clerkId: true,
            name: true,
            email: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            comments: true,
            timeLogs: true,
          },
        },
      },
    });

    // Add calculated fields
    const taskWithStats = {
      ...task,
      totalHours: 0,
      isOverdue: false,
      dueDateStatus: "normal",
      daysUntilDue: dueDate
        ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24))
        : null,
    };

    if (normalizedStatus !== "BACKLOG") {
      await recordWorkflowEvent({
        entity: "task",
        entityId: task.id,
        projectId: body.projectId,
        actorId: userId,
        status: normalizedStatus,
        message: `${task.title} created in ${normalizedStatus.replaceAll("_", " ")}`,
      });
    }

    return NextResponse.json(taskWithStats, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
