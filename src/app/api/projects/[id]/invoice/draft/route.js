// src/app/api/projects/[id]/invoice/draft/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  getUserRole,
  handleApiError,
  isClientRole,
} from "@/lib/api-helpers";
import { runPreInvoiceValidation, buildInvoiceLineItems } from "@/lib/invoices/invoiceValidation";
import { generateInvoiceNumber } from "@/lib/utils";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";

function coerceDate(value, fallback) {
  if (!value) return fallback;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? fallback : dt;
}

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(userId);
    if (!role || isClientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    if (body.hourlyRate === undefined || body.hourlyRate === null) {
      return NextResponse.json(
        { error: "An hourlyRate value is required." },
        { status: 400 },
      );
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, projectManagerId: userId },
      include: {
        client: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const validation = await runPreInvoiceValidation({ projectId, prismaClient: prisma });

    if (!validation.ready && !body.force) {
      return NextResponse.json(
        {
          error: "Pre-invoice validation failed",
          summary: validation.summary,
          recommendations: validation.recommendations,
        },
        { status: 422 },
      );
    }

    const rate = Number(body.hourlyRate) || 0;
    const periodStart = coerceDate(body.periodStart);
    const periodEnd = coerceDate(body.periodEnd);

    const { lineItems, total, hours } = await buildInvoiceLineItems({
      projectId,
      hourlyRate: rate,
      periodStart,
      periodEnd,
      prismaClient: prisma,
    });

    const issueDate = coerceDate(body.issueDate, new Date());
    const dueDate = coerceDate(
      body.dueDate,
      new Date(issueDate.getFullYear(), issueDate.getMonth(), issueDate.getDate() + 30),
    );

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        projectId,
        amount: total,
        status: "DRAFT",
        workflowState: validation.ready ? "READY_TO_SEND" : "AWAITING_VALIDATION",
        issueDate,
        dueDate,
        validationSummary: validation.summary,
        validatedAt: validation.ready ? new Date() : null,
        metadata: {
          lineItems,
          hours,
          rate,
          notes: body.notes || null,
          periodStart: periodStart ? periodStart.toISOString() : null,
          periodEnd: periodEnd ? periodEnd.toISOString() : null,
          validation,
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

    await recordWorkflowEvent({
      entity: "invoice",
      entityId: invoice.id,
      projectId,
      actorId: userId,
      status: "draft_created",
      message: `Invoice draft ${invoice.invoiceNumber} created`,
      metadata: {
        amount: invoice.amount,
        workflowState: invoice.workflowState,
      },
    });

    return NextResponse.json({
      message: "Invoice draft created",
      invoice,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
