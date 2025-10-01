// src/app/admin/intake/page.js
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import IntakeQueuePageClient from "./IntakeQueuePageClient";
import { intakeWorkflowStates } from "@/data/workflows/clientSubmissionToBilling";
import { requiredIntakeFieldIds } from "@/data/forms/clientIntakeForm.data";

export const revalidate = 0;

function computeMissingFields(formData) {
  if (!formData) return requiredIntakeFieldIds;
  return requiredIntakeFieldIds.filter((fieldId) => {
    const value = formData[fieldId];
    if (Array.isArray(value)) return value.length === 0;
    return !value;
  });
}

function serializeIntake(intake) {
  const missingRequired = computeMissingFields(intake.formData);
  return {
    id: intake.id,
    status: intake.status,
    summary: intake.summary,
    priority: intake.priority,
    submittedAt: intake.submittedAt.toISOString(),
    approvedForEstimateAt: intake.approvedForEstimateAt?.toISOString() || null,
    returnedForInfoAt: intake.returnedForInfoAt?.toISOString() || null,
    assignedAdmin: intake.assignedAdmin
      ? {
          id: intake.assignedAdmin.clerkId,
          name: intake.assignedAdmin.name,
          email: intake.assignedAdmin.email,
        }
      : null,
    client: {
      id: intake.client.id,
      companyName: intake.client.companyName,
      contactName: intake.client.contactName,
      contactEmail: intake.client.contactEmail,
    },
    proposal: intake.proposal
      ? {
          id: intake.proposal.id,
          status: intake.proposal.status,
        }
      : null,
    formData: intake.formData || {},
    notes: intake.notes,
    checklist: intake.checklist || {},
    missingRequired,
  };
}

export default async function AdminIntakePage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  const sp = await searchParams;
  const statusFilter = sp?.status ? String(sp.status) : "all";

  const where = statusFilter !== "all" ? { status: statusFilter } : {};

  const intakes = await prisma.intake.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          contactEmail: true,
        },
      },
      assignedAdmin: {
        select: {
          clerkId: true,
          name: true,
          email: true,
        },
      },
      proposal: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const serializedIntakes = intakes.map(serializeIntake);

  const statusOptions = intakeWorkflowStates
    .filter((state) => state.id !== "ARCHIVED")
    .map((state) => ({ value: state.id, label: state.label }));

  return (
    <AdminDashboardLayout activeTab="intake">
      <IntakeQueuePageClient
        initialIntakes={serializedIntakes}
        statusOptions={statusOptions}
        viewer={{ id: userId, role }}
        activeStatus={statusFilter}
      />
    </AdminDashboardLayout>
  );
}
/** @module admin/intake/page */
