// src/app/api/admin/intake/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, handleApiError, isClientRole } from "@/lib/api-helpers";
import { intakeWorkflowStates } from "@/data/workflows/clientSubmissionToBilling";

/**
 * GET /api/admin/intake
 * Returns a filtered list of projects currently moving through the intake pipeline.
 * Accessible to ADMIN and PROJECT_MANAGER roles.
 *
 * @param {Request} request - Incoming request instance.
 * @returns {Promise<NextResponse>} JSON response containing intake projects.
 */
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(userId);
    if (!role || isClientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const defaultStatuses = intakeWorkflowStates
      .filter((state) => state.id !== "ARCHIVED")
      .map((state) => state.id);

    const statuses = statusParam
      ? statusParam.split(",").filter(Boolean)
      : defaultStatuses;

    const projects = await prisma.project.findMany({
      where: {
        intakeStatus: { in: statuses },
      },
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
          },
        },
        projectManager: {
          select: { clerkId: true, name: true, email: true },
        },
        intake: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            assignedAdminId: true,
          },
        },
        proposal: {
          select: {
            id: true,
            status: true,
            sentAt: true,
          },
        },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    return handleApiError(error);
  }
}
