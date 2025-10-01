// src/app/api/files/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { handleApiError, getPaginationParams, getUserRole, isClientRole, validateRequiredFields } from "@/lib/api-helpers";
import { defaultFileReviewChecklist } from "@/data/review/fileChecklist.data";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(userId);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search");
    const projectId = searchParams.get("projectId");

    const whereClause = {
      project: isClientRole(role)
        ? { client: { userId } }
        : { projectManagerId: userId },
    };

    if (projectId) whereClause.project = { ...whereClause.project, id: projectId };
    if (search) {
      whereClause.OR = [
        { fileName: { contains: search, mode: "insensitive" } },
        { fileType: { contains: search, mode: "insensitive" } },
      ];
    }

    // Determine safe orderBy (File has uploadedAt, not createdAt)
    let sortBy = searchParams.get("sortBy") || "uploadedAt";
    if (sortBy === "createdAt") sortBy = "uploadedAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const orderBy = { [sortBy]: sortOrder };

    const [files, totalCount] = await Promise.all([
      prisma.file.findMany({
        where: whereClause,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              client: { select: { id: true, companyName: true } },
            },
          },
          approvals: {
            include: { actor: { select: { clerkId: true, name: true, email: true } } },
            orderBy: { createdAt: "desc" },
          },
          uploadedBy: { select: { clerkId: true, name: true, email: true } },
          reviewChecklist: {
            orderBy: { createdAt: "asc" },
          },
          annotations: {
            orderBy: { createdAt: "desc" },
            include: {
              author: { select: { clerkId: true, name: true, email: true } },
              resolvedBy: { select: { clerkId: true, name: true, email: true } },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.file.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      files,
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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = await getUserRole(userId);
    if (isClientRole(role)) {
      return NextResponse.json({ error: "Forbidden: clients cannot upload files" }, { status: 403 });
    }

    const body = await request.json();
    validateRequiredFields(body, ["projectId", "fileName", "url", "fileType"]);

    // Verify project belongs to this PM
    const project = await prisma.project.findFirst({
      where: { id: body.projectId, projectManagerId: userId },
      select: { id: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });

    const latestVersion = await prisma.file.aggregate({
      where: {
        projectId: body.projectId,
        fileName: body.fileName,
      },
      _max: { version: true },
    });

    const computedVersion =
      typeof body.version === "number" && body.version > 0
        ? body.version
        : (latestVersion._max.version || 0) + 1;

    const created = await prisma.file.create({
      data: {
        fileName: body.fileName,
        url: body.url,
        fileType: body.fileType,
        projectId: body.projectId,
        uploadedById: userId,
        version: computedVersion,
        reviewChecklist: {
          create: defaultFileReviewChecklist.map((item) => ({
            key: item.id,
            label: item.label,
            description: item.description,
          })),
        },
      },
      include: {
        project: { select: { id: true, name: true } },
        uploadedBy: { select: { clerkId: true, name: true, email: true } },
        approvals: {
          include: { actor: { select: { clerkId: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
        reviewChecklist: {
          orderBy: { createdAt: "asc" },
        },
        annotations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Log upload in approvals history
    await prisma.fileApproval.create({
      data: {
        fileId: created.id,
        actorId: userId,
        action: "UPLOADED",
        note: body.note || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
