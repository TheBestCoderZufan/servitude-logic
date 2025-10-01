// src/app/dashboard/proposals/[id]/page.js
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import ProposalDetailPageClient from "./ProposalDetailPageClient";
import { pricingModules } from "@/data/pricing/modules.data";

function serializeProposal(proposal) {
  return {
    id: proposal.id,
    status: proposal.status,
    summary: proposal.summary || "",
    lineItems: proposal.lineItems || [],
    selectedModules: proposal.selectedModules || [],
    estimatedHours: proposal.estimatedHours || 0,
    estimateAmount: proposal.estimateAmount || 0,
    sentAt: proposal.sentAt ? proposal.sentAt.toISOString() : null,
    clientApprovedAt: proposal.clientApprovedAt ? proposal.clientApprovedAt.toISOString() : null,
    clientDeclinedAt: proposal.clientDeclinedAt ? proposal.clientDeclinedAt.toISOString() : null,
    approvalNotes: proposal.approvalNotes || "",
    intake: proposal.intake
      ? {
          id: proposal.intake.id,
          projectName: proposal.intake.formData?.projectName || proposal.intake.summary || "",
          goalStatement: proposal.intake.formData?.goalStatement || "",
          budgetRange: proposal.intake.formData?.budgetRange || "",
          targetLaunch: proposal.intake.formData?.targetLaunch || "",
          stakeholders: proposal.intake.formData?.stakeholders || "",
        }
      : null,
    project: proposal.project
      ? {
          id: proposal.project.id,
          name: proposal.project.name,
        }
      : null,
  };
}

export default async function ProposalDetailPage({ params }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  if (!isClientRole(role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
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
    redirect("/dashboard/proposals");
  }

  const clientOwnsProposal =
    (proposal.intake && proposal.intake.client.userId === userId) ||
    (proposal.project && proposal.project.client.userId === userId);

  if (!clientOwnsProposal) {
    redirect("/dashboard/proposals");
  }

  const normalizedProposal = serializeProposal(proposal);

  return (
    <ClientDashboardLayout>
      <ProposalDetailPageClient proposal={normalizedProposal} modules={pricingModules} />
    </ClientDashboardLayout>
  );
}
/** @module dashboard/proposals/[id]/page */
