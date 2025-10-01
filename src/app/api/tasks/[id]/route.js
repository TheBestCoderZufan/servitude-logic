// src/app/api/tasks/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  handleApiError,
  validateRequiredFields,
  getUserRole,
  isClientRole,
} from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";
import {
  normalizeTransitionNote,
  statusRequiresNote,
} from "@/lib/tasks/taskWorkflow";

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const role = await getUserRole(userId);

    const task = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { assigneeId: userId },
          { project: { projectManagerId: userId } },
          { project: { client: { userId: userId } } },
        ],
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
          },
        },
        assignee: {
          select: {
            clerkId: true,
            name: true,
            email: true,
            role: true,
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
        },
        _count: {
          select: {
            comments: true,
            timeLogs: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Calculate detailed stats
    const totalHours = task.timeLogs.reduce((sum, log) => sum + log.hours, 0);

    // Group time logs by user
    const timeLogsByUser = task.timeLogs.reduce((acc, log) => {
      const userKey = log.user.clerkId;
      if (!acc[userKey]) {
        acc[userKey] = {
          user: log.user,
          totalHours: 0,
          logs: [],
        };
      }
      acc[userKey].totalHours += log.hours;
      acc[userKey].logs.push(log);
      return acc;
    }, {});

    const taskWithStats = {
      ...task,
      totalHours,
      isOverdue:
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        !["DONE", "CLIENT_APPROVED"].includes(task.status),
      dueDateStatus: (() => {
        if (!task.dueDate) return "normal";
        const now = new Date();
        const due = new Date(task.dueDate);
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0 && !["DONE", "CLIENT_APPROVED"].includes(task.status)) {
          return "overdue";
        }
        if (diffDays === 0) {
          return "due-today";
        }
        if (diffDays <= 3) {
          return "due-soon";
        }
        return "normal";
      })(),
      daysUntilDue: task.dueDate
        ? Math.ceil(
            (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
          )
        : null,
      timeLogsByUser: Object.values(timeLogsByUser),
      canEdit:
        task.assigneeId === userId || task.project.projectManagerId === userId,
    };

    return NextResponse.json(taskWithStats);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json(
        { error: "Forbidden: clients cannot update tasks" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const rawTransitionNote = typeof body.transitionNote === "string" ? body.transitionNote : "";
    const deferDeliverable = body.deferDeliverable === true;
    const rawDeferNote = typeof body.deferNote === "string" ? body.deferNote : "";

    // Verify task exists and user has access
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { assigneeId: userId },
          {
            project: {
              projectManagerId: userId,
            },
          },
        ],
      },
      include: {
        project: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Validate required fields
    validateRequiredFields(body, ["title"]);

    // Validate assignee if provided
    if (body.assigneeId && body.assigneeId !== existingTask.assigneeId) {
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
      : existingTask.status;
    const statusChanged = normalizedStatus !== existingTask.status;

    if (statusChanged && statusRequiresNote(normalizedStatus) && rawTransitionNote.trim().length === 0) {
      return NextResponse.json(
        {
          error: `A transition note is required when moving a task to ${normalizedStatus.replaceAll("_", " ")}.`,
        },
        { status: 400 },
      );
    }

    if (deferDeliverable && rawDeferNote.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Provide a deferment note to document billing exceptions.",
        },
        { status: 400 },
      );
    }

    const statusHistoryCreates = [];
    if (statusChanged) {
      statusHistoryCreates.push({
        fromStatus: existingTask.status,
        toStatus: normalizedStatus,
        note: normalizeTransitionNote(
          rawTransitionNote,
          `Status changed to ${normalizedStatus.replaceAll("_", " ")}`,
        ),
        actorId: userId,
      });
    }

    if (deferDeliverable) {
      statusHistoryCreates.push({
        context: "BILLING_DEFERMENT",
        note: normalizeTransitionNote(rawDeferNote, "Deliverable deferred"),
        actorId: userId,
        fromStatus: normalizedStatus,
        toStatus: normalizedStatus,
      });
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || null,
        status: normalizedStatus,
        priority: body.priority?.toUpperCase() || existingTask.priority,
        dueDate: dueDate,
        assigneeId: body.assigneeId || null,
        isDeliverable:
          typeof body.isDeliverable === "boolean"
            ? body.isDeliverable
            : existingTask.isDeliverable,
        deliverableKey:
          body.deliverableKey === undefined || body.deliverableKey === null
            ? existingTask.deliverableKey
            : body.deliverableKey || null,
        ...(statusHistoryCreates.length
          ? {
              statusHistory: {
                create: statusHistoryCreates,
              },
            }
          : {}),
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

    if (statusChanged) {
      const transitionEntry = statusHistoryCreates.find((entry) => entry.context !== "BILLING_DEFERMENT");
      await recordWorkflowEvent({
        entity: "task",
        entityId: updatedTask.id,
        projectId: updatedTask.project.id,
        actorId: userId,
        status: normalizedStatus,
        message: `${updatedTask.title} moved to ${normalizedStatus.replaceAll("_", " ")}`,
        metadata: {
          fromStatus: existingTask.status,
          transitionNote: transitionEntry?.note || null,
        },
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify task exists and user has permission to delete
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          projectManagerId: userId, // Only project managers can delete tasks
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Delete task and all related data (cascade)
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
