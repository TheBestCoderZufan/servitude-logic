// src/app/api/proposals/[id]/respond/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, handleApiError, isClientRole } from "@/lib/api-helpers";
import { recordWorkflowEvent } from "@/lib/notifications/workflowNotifications";
import { onboardingChecklist, onboardingTaskTemplates } from "@/data/onboarding/checklists.data";

const ACTIONS = new Set(["approve", "decline"]);

export async function POST(request, context) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(userId);
    if (!role || !isClientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ error: "Proposal id missing" }, { status: 400 });
    }

    const body = await request.json();
    const action = String(body?.action || "");
    if (!ACTIONS.has(action)) {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
    const comment = typeof body?.comment === "string" ? body.comment.trim() : "";

    const proposal = await prisma.projectProposal.findUnique({
      where: { id },
      include: {
        intake: {
          include: {
            client: true,
          },
        },
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const ownsIntake = proposal.intake?.client?.userId === userId;
    const ownsProject = proposal.project?.client?.userId === userId;
    if (!ownsIntake && !ownsProject) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      let projectId = proposal.projectId;
      let updatedProposal;

      if (action === "approve") {
        updatedProposal = await tx.projectProposal.update({
          where: { id },
          data: {
            status: "APPROVED",
            clientApprovedAt: now,
            clientDeclinedAt: null,
            approvalNotes: comment || proposal.approvalNotes,
          },
        });

        if (!projectId) {
          const intake = await tx.intake.findUnique({ where: { id: proposal.intakeId } });
          if (!intake) {
            throw new Error("Intake not found for proposal");
          }

          let projectManagerId = intake.assignedAdminId;
          if (!projectManagerId) {
            const pm = await tx.user.findFirst({ where: { role: "PROJECT_MANAGER" } });
            projectManagerId = pm?.clerkId || userId;
          }

          const formData = intake.formData || {};
          const createdProject = await tx.project.create({
            data: {
              name: formData.projectName || proposal.summary || "New project",
              description: formData.goalStatement || proposal.summary || "",
              status: "PLANNING",
              workflowPhase: "KICKOFF",
              workflowPhaseUpdatedAt: now,
              intakeStatus: "CLIENT_SCOPE_APPROVED",
              startDate: now,
              clientId: intake.clientId,
              projectManagerId,
              workflowMetadata: {
                onboardingChecklist,
                createdFromProposal: proposal.id,
              },
            },
          });

          projectId = createdProject.id;

          if (onboardingTaskTemplates.length > 0) {
            await tx.task.createMany({
              data: onboardingTaskTemplates.map((template) => ({
                title: template.title,
                description: template.description,
                status: template.status,
                priority: template.priority,
                projectId,
              })),
            });
          }

          await tx.intake.update({
            where: { id: intake.id },
            data: {
              projectId,
              status: "CLIENT_SCOPE_APPROVED",
              clientDecisionAt: now,
            },
          });

          await tx.projectProposal.update({
            where: { id },
            data: { projectId },
          });
        } else {
          await tx.project.update({
            where: { id: projectId },
            data: {
              workflowPhase: "KICKOFF",
              workflowPhaseUpdatedAt: now,
              intakeStatus: "CLIENT_SCOPE_APPROVED",
            },
          });

          if (proposal.intakeId) {
            await tx.intake.update({
              where: { id: proposal.intakeId },
              data: {
                status: "CLIENT_SCOPE_APPROVED",
                clientDecisionAt: now,
              },
            });
          }
        }

        await recordWorkflowEvent({
          prismaClient: tx,
          entity: "proposal",
          entityId: proposal.id,
          projectId,
          actorId: userId,
          status: "APPROVED",
          message: comment,
        });

        if (proposal.intakeId) {
          await recordWorkflowEvent({
            prismaClient: tx,
            entity: "intake",
            entityId: proposal.intakeId,
            projectId,
            actorId: userId,
            status: "CLIENT_SCOPE_APPROVED",
            message: comment,
          });
        }

        return await tx.projectProposal.findUnique({ where: { id }, include: { intake: true, project: true } });
      }

      // decline path
      updatedProposal = await tx.projectProposal.update({
        where: { id },
        data: {
          status: "DECLINED",
          clientDeclinedAt: now,
          approvalNotes: comment,
        },
      });

      if (proposal.intakeId) {
        await tx.intake.update({
          where: { id: proposal.intakeId },
          data: {
            status: "CLIENT_SCOPE_DECLINED",
            clientDecisionAt: now,
          },
        });
      }

      await recordWorkflowEvent({
        prismaClient: tx,
        entity: "proposal",
        entityId: proposal.id,
        projectId: proposal.projectId || null,
        actorId: userId,
        status: "DECLINED",
        message: comment,
      });

      if (proposal.intakeId) {
        await recordWorkflowEvent({
          prismaClient: tx,
          entity: "intake",
          entityId: proposal.intakeId,
          projectId: proposal.projectId || null,
          actorId: userId,
          status: "CLIENT_SCOPE_DECLINED",
          message: comment,
        });
      }

      return await tx.projectProposal.findUnique({ where: { id }, include: { intake: true, project: true } });
    });

    return NextResponse.json({ proposal: result });
  } catch (error) {
    return handleApiError(error);
  }
}
