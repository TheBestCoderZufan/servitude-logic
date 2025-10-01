// src/app/api/dashboard/tasks/route.js
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
    const limit = parseInt(searchParams.get("limit")) || 10;

    if (userIdParam !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
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
        OR: [
          {
            dueDate: {
              lte: nextWeek,
            },
          },
          {
            dueDate: null,
          },
        ],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            clerkId: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        {
          dueDate: {
            sort: "asc",
            nulls: "last",
          },
        },
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: limit,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming tasks" },
      { status: 500 }
    );
  }
}
