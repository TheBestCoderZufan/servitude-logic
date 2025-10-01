// src/app/api/projects/[id]/invoice/validate/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, handleApiError, isClientRole } from "@/lib/api-helpers";
import { runPreInvoiceValidation } from "@/lib/invoices/invoiceValidation";

export async function GET(_request, { params }) {
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

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        projectManagerId: userId,
      },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const validation = await runPreInvoiceValidation({ projectId, prismaClient: prisma });

    return NextResponse.json(validation);
  } catch (error) {
    return handleApiError(error);
  }
}
