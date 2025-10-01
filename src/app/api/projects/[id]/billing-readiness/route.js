// src/app/api/projects/[id]/billing-readiness/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import { evaluateBillingReadiness } from "@/lib/workflows/billingReadiness";

/**
 * Returns billing readiness diagnostics for the requested project.
 *
 * @param {Request} _request - Incoming HTTP request (unused).
 * @param {{ params: Promise<{ id: string }> }} context - Route context containing project params.
 * @returns {Promise<NextResponse>} JSON payload with readiness state or error status.
 */
export async function GET(_request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const role = await getUserRole(userId);

  if (!role || isClientRole(role) || (role !== "ADMIN" && role !== "PROJECT_MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findFirst({
    where: role === "ADMIN" ? { id: projectId } : { id: projectId, projectManagerId: userId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const readiness = await evaluateBillingReadiness({ projectId });

  return NextResponse.json(readiness);
}
