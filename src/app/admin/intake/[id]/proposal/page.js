// src/app/admin/intake/[id]/proposal/page.js
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import ProposalWorkspacePageClient from "./ProposalWorkspacePageClient";
import { pricingModules } from "@/data/pricing/modules.data";

function serializeIntake(intake) {
  return {
    id: intake.id,
    status: intake.status,
    summary: intake.summary,
    formData: intake.formData || {},
    client: {
      id: intake.client.id,
      companyName: intake.client.companyName,
      contactName: intake.client.contactName,
      contactEmail: intake.client.contactEmail,
    },
  };
}

function serializeProposal(proposal) {
  if (!proposal) return null;
  return {
    id: proposal.id,
    status: proposal.status,
    summary: proposal.summary || "",
    lineItems: proposal.lineItems || [],
    estimatedHours: proposal.estimatedHours || 0,
    estimateAmount: proposal.estimateAmount || 0,
    selectedModules: proposal.selectedModules || [],
    sentAt: proposal.sentAt ? proposal.sentAt.toISOString() : null,
    clientApprovedAt: proposal.clientApprovedAt ? proposal.clientApprovedAt.toISOString() : null,
    clientDeclinedAt: proposal.clientDeclinedAt ? proposal.clientDeclinedAt.toISOString() : null,
  };
}

export default async function ProposalWorkspacePage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  const { id } = await params;
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
      proposal: true,
    },
  });

  if (!intake) {
    redirect("/admin/intake");
  }

  const normalizedIntake = serializeIntake(intake);
  const normalizedProposal = serializeProposal(intake.proposal);

  return (
    <AdminDashboardLayout>
      <ProposalWorkspacePageClient
        intake={normalizedIntake}
        initialProposal={normalizedProposal}
        pricingModules={pricingModules}
        viewer={{ id: userId, role }}
      />
    </AdminDashboardLayout>
  );
}
/** @module admin/intake/[id]/proposal/page */
