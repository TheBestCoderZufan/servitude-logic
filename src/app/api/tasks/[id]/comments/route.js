// src/app/api/tasks/[id]/comments/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { handleApiError, validateRequiredFields } from "@/lib/api-helpers";

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { assigneeId: userId },
          { project: { projectManagerId: userId } },
          { project: { client: { userId: userId } } },
        ],
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
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
    });

    return NextResponse.json(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;
    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, ["content"]);

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { assigneeId: userId },
          { project: { projectManagerId: userId } },
          { project: { client: { userId: userId } } },
        ],
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        authorId: userId,
        taskId,
      },
      include: {
        author: {
          select: {
            clerkId: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
