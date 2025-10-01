// src/app/api/admin/intake/[id]/proposal/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, handleApiError, isClientRole } from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";

function sanitizeLineItems(lineItems) {
  if (!Array.isArray(lineItems)) return [];
  return lineItems
    .map((item) => ({
      moduleId: item.moduleId || null,
      title: typeof item.title === "string" ? item.title.trim() : "",
      description: typeof item.description === "string" ? item.description.trim() : "",
      hours: Number(item.hours) || 0,
      rate: Number(item.rate) || 0,
      amount: Number(item.amount) || 0,
    }))
    .filter((item) => item.title);
}

export async function POST(request, context) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(userId);
    if (!role || isClientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ error: "Intake id missing" }, { status: 400 });
    }

    const body = await request.json();
    const summary = typeof body?.summary === "string" ? body.summary.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const status = typeof body?.status === "string" ? body.status : "DRAFT";
    const selectedModules = Array.isArray(body?.selectedModules) ? body.selectedModules : [];
    const lineItems = sanitizeLineItems(body?.lineItems);
    const estimatedHours = lineItems.reduce((acc, item) => acc + item.hours, 0);
    const estimateAmount = lineItems.reduce((acc, item) => acc + item.amount, 0);

    const intake = await prisma.intake.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
          },
        },
      },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const now = new Date();
    const shouldMarkSent = status === "CLIENT_APPROVAL_PENDING";

    const proposal = await prisma.$transaction(async (tx) => {
      const upserted = await tx.projectProposal.upsert({
        where: { intakeId: id },
        update: {
          summary,
          lineItems,
          estimatedHours,
          estimateAmount,
          selectedModules,
          status,
          preparedById: userId,
          sentAt: shouldMarkSent ? now : undefined,
        },
        create: {
          intakeId: id,
          summary,
          lineItems,
          estimatedHours,
          estimateAmount,
          selectedModules,
          status,
          preparedById: userId,
          sentAt: shouldMarkSent ? now : null,
        },
        include: {
          intake: true,
        },
      });

      const updates = {};
      if (!intake.estimateInProgressAt) {
        updates.estimateInProgressAt = now;
      }
      if (intake.status === "REVIEW_PENDING" || intake.status === "RETURNED_FOR_INFO") {
        updates.status = "ESTIMATE_IN_PROGRESS";
      }
      if (shouldMarkSent) {
        updates.status = "ESTIMATE_SENT";
        updates.estimateSentAt = now;
      }
      if (Object.keys(updates).length > 0) {
        await tx.intake.update({ where: { id }, data: updates });
      }

      await recordWorkflowEvent({
        prismaClient: tx,
        entity: "proposal",
        entityId: upserted.id,
        actorId: userId,
        status,
        message,
        metadata: {
          estimateAmount,
          estimatedHours,
          selectedModules,
        },
      });

      return upserted;
    });

    return NextResponse.json({ proposal });
  } catch (error) {
    return handleApiError(error);
  }
}
