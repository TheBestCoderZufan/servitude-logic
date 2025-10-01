// src/app/api/projects/[id]/estimate/response/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";
import { broadcastWorkflowNotification, recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";

/**
 * PATCH handler allowing clients to approve or decline estimates.
 *
 * @param {Request} request - Incoming HTTP request.
 * @param {{ params: Promise<{ id: string }> }} context - Route context with params promise.
 * @returns {Promise<NextResponse>} Response payload.
 */
export async function PATCH(request, context) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ error: "Project id missing" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { userId: true } },
        proposal: true,
        intake: { select: { id: true } },
      },
    });

    if (!project || project.client.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!project.proposal) {
      return NextResponse.json({ error: "Proposal not available" }, { status: 400 });
    }

    const body = await request.json();
    const { action, notes = "" } = body || {};

    if (action !== "approve" && action !== "decline") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const now = new Date();
    const isApproval = action === "approve";
    const previousStatus = project.proposal.status;

    const proposalUpdate = isApproval
      ? {
          status: "APPROVED",
          clientApprovedAt: now,
          clientDeclinedAt: null,
          approvalNotes: notes || project.proposal.approvalNotes,
        }
      : {
          status: "DECLINED",
          clientDeclinedAt: now,
          clientApprovedAt: null,
          approvalNotes: notes || project.proposal.approvalNotes,
        };

    const projectUpdate = isApproval
      ? {
          intakeStatus: "CLIENT_SCOPE_APPROVED",
          workflowPhase: "KICKOFF",
          workflowPhaseUpdatedAt: now,
        }
      : {
          intakeStatus: "CLIENT_SCOPE_DECLINED",
          workflowPhase: "ESTIMATION",
          workflowPhaseUpdatedAt: now,
        };

    const { updatedProposal, workflowEvent } = await prisma.$transaction(async (tx) => {
      const proposalRecord = await tx.projectProposal.update({
        where: { projectId: id },
        data: proposalUpdate,
      });

      await tx.project.update({
        where: { id },
        data: projectUpdate,
      });

      if (project.intake) {
        await tx.intake.update({
          where: { id: project.intake.id },
          data: {
            status: projectUpdate.intakeStatus,
            clientDecisionAt: now,
          },
        });
      }

      const event = await recordWorkflowEvent({
        prismaClient: tx,
        entity: "proposal",
        entityId: project.proposal.id,
        projectId: id,
        actorId: userId,
        status: proposalUpdate.status,
        message: notes,
        metadata: {
          previousStatus,
          workflowPhase: projectUpdate.workflowPhase,
        },
        broadcast: false,
      });

      return { updatedProposal: proposalRecord, workflowEvent: event };
    });

    await broadcastWorkflowNotification(workflowEvent);

    return NextResponse.json({ proposal: updatedProposal });
  } catch (error) {
    return handleApiError(error);
  }
}
