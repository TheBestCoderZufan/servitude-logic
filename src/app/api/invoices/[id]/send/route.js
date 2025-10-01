// src/app/api/invoices/[id]/send/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { handleApiError } from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify invoice exists and user has access
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        project: {
          projectManagerId: userId,
        },
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Can only send draft invoices
    if (existingInvoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only send draft invoices" },
        { status: 400 }
      );
    }

    // Update invoice status to SENT
    const now = new Date();

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: now,
        workflowState: "SENT_AND_PENDING_PAYMENT",
        scheduledSendAt: null,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    await recordWorkflowEvent({
      entity: "invoice",
      entityId: updatedInvoice.id,
      projectId: updatedInvoice.projectId,
      actorId: userId,
      status: "sent",
      message: `Invoice ${updatedInvoice.invoiceNumber} sent to client`,
      metadata: {
        amount: updatedInvoice.amount,
        dueDate: updatedInvoice.dueDate?.toISOString?.() || null,
      },
    });

    return NextResponse.json({
      message: "Invoice sent successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
