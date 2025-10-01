// src/app/api/invoices/[id]/mark-paid/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function ensureFollowUpTasks({ projectId }) {
  const existing = await prisma.task.findMany({
    where: {
      projectId,
      deliverableKey: { in: ["feedback:client-survey", "feedback:internal-retro"] },
    },
    select: { deliverableKey: true },
  });
  const existingKeys = new Set(existing.map((task) => task.deliverableKey));

  const toCreate = [];

  if (!existingKeys.has("feedback:client-survey")) {
    toCreate.push({
      title: "Send client satisfaction survey",
      description: "Collect feedback from the client after payment to inform future improvements.",
      projectId,
      status: "BACKLOG",
      priority: "MEDIUM",
      dueDate: addDays(new Date(), 7),
      deliverableKey: "feedback:client-survey",
      isDeliverable: false,
    });
  }

  if (!existingKeys.has("feedback:internal-retro")) {
    toCreate.push({
      title: "Run internal retrospective",
      description: "Hold a team retrospective to capture lessons learned and follow-up tasks.",
      projectId,
      status: "BACKLOG",
      priority: "MEDIUM",
      dueDate: addDays(new Date(), 10),
      deliverableKey: "feedback:internal-retro",
      isDeliverable: false,
    });
  }

  if (toCreate.length > 0) {
    await prisma.task.createMany({
      data: toCreate,
    });
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify invoice exists and user has access
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        project: {
          projectManagerId: userId,
        },
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Can only mark sent or overdue invoices as paid
    if (!["SENT", "OVERDUE"].includes(existingInvoice.status)) {
      return NextResponse.json(
        { error: "Can only mark sent or overdue invoices as paid" },
        { status: 400 }
      );
    }

    // Update invoice status to PAID
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: "PAID",
        workflowState: "PAID_AND_CONFIRMED",
        closedAt: new Date(),
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

  await ensureFollowUpTasks({ projectId: updatedInvoice.projectId });

    await recordWorkflowEvent({
      entity: "invoice",
      entityId: updatedInvoice.id,
      projectId: updatedInvoice.projectId,
      actorId: userId,
      status: "paid",
      message: `Invoice ${updatedInvoice.invoiceNumber} marked as paid`,
      metadata: {
        amount: updatedInvoice.amount,
      },
    });

    return NextResponse.json({
      message: "Invoice marked as paid",
      invoice: updatedInvoice,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
