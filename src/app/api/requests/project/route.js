// src/app/api/requests/project/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { handleApiError } from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";
import { requiredIntakeFieldIds } from "@/data/forms/clientIntakeForm.data";

function sanitizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function sanitizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(sanitizeString).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map(sanitizeString)
      .filter(Boolean);
  }
  return [];
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const formData = {
      projectName: sanitizeString(body?.projectName),
      goalStatement: sanitizeString(body?.goalStatement),
      projectType: sanitizeString(body?.projectType),
      budgetRange: sanitizeString(body?.budgetRange),
      targetLaunch: sanitizeString(body?.targetLaunch),
      successMetrics: sanitizeString(body?.successMetrics),
      coreFeatures: sanitizeString(body?.coreFeatures),
      integrations: sanitizeString(body?.integrations),
      existingAssets: sanitizeString(body?.existingAssets),
      complianceNeeds: sanitizeString(body?.complianceNeeds),
      stakeholders: sanitizeString(body?.stakeholders),
      risks: sanitizeString(body?.risks),
      preferredCommunication: sanitizeString(body?.preferredCommunication),
      decisionDeadline: sanitizeString(body?.decisionDeadline),
      attachments: sanitizeArray(body?.attachments),
      additionalNotes: sanitizeString(body?.additionalNotes),
      assetChecklist: sanitizeString(body?.assetChecklist),
    };

    const missingRequired = requiredIntakeFieldIds.filter((field) => !formData[field]);
    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingRequired.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Ensure the client exists for this user
    let client = await prisma.client.findUnique({ where: { userId } });
    if (!client) {
      // Fallback: create a minimal client record if auto-provisioning hasn't run yet
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      client = await prisma.client.create({
        data: {
          userId,
          companyName: user?.name || user?.email?.split("@")[0] || "New Client",
          contactName: user?.name || "Client",
          contactEmail: user?.email || `${userId}@example.com`,
        },
      });
    }

    // Choose a default project manager (prefer PROJECT_MANAGER, then ADMIN)
    let pm = await prisma.user.findFirst({ where: { role: "PROJECT_MANAGER" } });
    if (!pm) pm = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const assignedAdminId = pm?.clerkId || null;

    const intake = await prisma.intake.create({
      data: {
        clientId: client.id,
        assignedAdminId,
        status: "REVIEW_PENDING",
        summary: formData.goalStatement.slice(0, 280),
        formData,
        notes: formData.additionalNotes || null,
        checklist: {
          attachments: formData.attachments,
          missingRequired: [],
        },
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
          },
        },
        assignedAdmin: {
          select: { clerkId: true, name: true, email: true },
        },
      },
    });

    await recordWorkflowEvent({
      entity: "intake",
      entityId: intake.id,
      projectId: undefined,
      actorId: userId,
      status: "REVIEW_PENDING",
      message: formData.goalStatement.slice(0, 180),
      metadata: {
        assignedAdminId,
        budgetRange: formData.budgetRange,
        targetLaunch: formData.targetLaunch,
      },
    });

    return NextResponse.json({
      intake: {
        id: intake.id,
        status: intake.status,
        summary: intake.summary,
        submittedAt: intake.submittedAt,
        assignedAdmin: intake.assignedAdmin,
      },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
