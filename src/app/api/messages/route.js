// src/app/api/messages/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  handleApiError,
  getPaginationParams,
  getUserRole,
  isClientRole,
} from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = await getUserRole(userId);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const projectId = searchParams.get("projectId");

    const where = {
      AND: [
        projectId ? { projectId } : {},
        isClientRole(role)
          ? { OR: [{ project: { client: { userId } } }, { userId }] }
          : { OR: [{ project: { projectManagerId: userId } }, { userId }] },
      ],
    };

    const [items, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          project: { select: { id: true, name: true } },
          user: { select: { clerkId: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    const item = items.map((item) => {
      return {
        ...item,
        text: JSON.parse(item.text),
      };
    });

    return NextResponse.json({
      messages: item,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
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
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { text, projectId, type = "client_message" } = body;
    if (!text || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields: text, projectId" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ projectManagerId: userId }, { client: { userId } }],
      },
    });
    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const created = await prisma.activityLog.create({
      data: {
        text,
        type,
        userId,
        projectId,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
