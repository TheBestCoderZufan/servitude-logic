// src/app/api/admin/intake/[id]/transition/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, handleApiError, isClientRole } from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";

const ACTIONS = new Set(["assign_to_me", "approve_for_estimate", "return_for_info"]);

function sanitizeComment(value) {
  if (typeof value !== "string") return "";
  return value.trim();
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
    const action = String(body?.action || "");
    if (!ACTIONS.has(action)) {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const comment = sanitizeComment(body?.comment);
    if ((action === "approve_for_estimate" || action === "return_for_info") && !comment) {
      return NextResponse.json({ error: "Please include a comment." }, { status: 400 });
    }

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
    let updatedIntake;
    let eventStatus = intake.status;
    let metadata = {};

    if (action === "assign_to_me") {
      updatedIntake = await prisma.intake.update({
        where: { id },
        data: {
          assignedAdminId: userId,
          notes: comment || intake.notes,
        },
        include: {
          client: true,
          assignedAdmin: {
            select: { clerkId: true, name: true, email: true },
          },
        },
      });
      eventStatus = "ASSIGNED";
      metadata = { assignedAdminId: userId };
    }

    if (action === "approve_for_estimate") {
      updatedIntake = await prisma.intake.update({
        where: { id },
        data: {
          status: "APPROVED_FOR_ESTIMATE",
          approvedForEstimateAt: now,
          assignedAdminId: userId,
          notes: comment,
        },
        include: {
          client: true,
          assignedAdmin: {
            select: { clerkId: true, name: true, email: true },
          },
        },
      });
      eventStatus = "APPROVED_FOR_ESTIMATE";
      metadata = { approvedForEstimateAt: now.toISOString() };
    }

    if (action === "return_for_info") {
      const missingFields = Array.isArray(body?.missingFields)
        ? body.missingFields.filter((field) => typeof field === "string" && field.trim().length > 0)
        : [];

      updatedIntake = await prisma.intake.update({
        where: { id },
        data: {
          status: "RETURNED_FOR_INFO",
          returnedForInfoAt: now,
          notes: comment,
          checklist: {
            ...(intake.checklist || {}),
            missingFields,
            lastComment: comment,
            lastUpdatedBy: userId,
          },
        },
        include: {
          client: true,
          assignedAdmin: {
            select: { clerkId: true, name: true, email: true },
          },
        },
      });
      eventStatus = "RETURNED_FOR_INFO";
      metadata = {
        missingFields,
        returnedForInfoAt: now.toISOString(),
      };
    }

    await recordWorkflowEvent({
      entity: "intake",
      entityId: id,
      actorId: userId,
      status: eventStatus,
      message: comment,
      metadata,
    });

    return NextResponse.json({ intake: updatedIntake });
  } catch (error) {
    return handleApiError(error);
  }
}
