// src/app/dashboard/proposals/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import ProposalsPageClient from "./ProposalsPageClient";

export const revalidate = 0;

function serializeProposal(proposal) {
  return {
    id: proposal.id,
    status: proposal.status,
    summary: proposal.summary || "",
    estimateAmount: proposal.estimateAmount || 0,
    estimatedHours: proposal.estimatedHours || 0,
    sentAt: proposal.sentAt ? proposal.sentAt.toISOString() : null,
    clientApprovedAt: proposal.clientApprovedAt ? proposal.clientApprovedAt.toISOString() : null,
    clientDeclinedAt: proposal.clientDeclinedAt ? proposal.clientDeclinedAt.toISOString() : null,
    intake: proposal.intake
      ? {
          id: proposal.intake.id,
          projectName: proposal.intake.formData?.projectName || proposal.intake.summary || "",
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

export default async function ClientProposalsPage() {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  const clientScope = isClientRole(role);
  if (!clientScope) {
    return (
      <ClientDashboardLayout>
        <div style={{ padding: "1.5rem" }}>Proposals are only available in the client portal.</div>
      </ClientDashboardLayout>
    );
  }

  const proposals = await prisma.projectProposal.findMany({
    where: {
      OR: [
        { intake: { client: { userId } } },
        { project: { client: { userId } } },
      ],
    },
    include: {
      intake: true,
      project: true,
    },
    orderBy: [{ sentAt: "desc" }, { updatedAt: "desc" }],
  });

  const serialized = proposals.map(serializeProposal);

  return (
    <ClientDashboardLayout>
      <ProposalsPageClient proposals={serialized} />
    </ClientDashboardLayout>
  );
}
/** @module dashboard/proposals/page */
