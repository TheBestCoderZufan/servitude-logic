// src/app/api/invoices/[id]/schedule/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";

function parseDate(value) {
  if (!value) return null;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const scheduledDate = parseDate(body.scheduledSendAt);

    if (!scheduledDate) {
      return NextResponse.json(
        { error: "A valid scheduled send date is required" },
        { status: 400 },
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        project: { projectManagerId: userId },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft invoices can be scheduled" },
        { status: 400 },
      );
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        scheduledSendAt: scheduledDate,
        workflowState: "SCHEDULED",
      },
      include: {
        project: { select: { id: true } },
      },
    });

    await recordWorkflowEvent({
      entity: "invoice",
      entityId: updated.id,
      projectId: updated.projectId,
      actorId: userId,
      status: "scheduled",
      message: `Invoice ${updated.invoiceNumber} scheduled for delivery`,
      metadata: {
        scheduledSendAt: scheduledDate.toISOString(),
      },
    });

    return NextResponse.json({
      message: "Invoice scheduled",
      invoice: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
