// src/app/dashboard/approvals/[id]/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import ApprovalDetailPageClient from "./ApprovalDetailPageClient";

export const revalidate = 0;

export default async function ApprovalDetailPage({ params }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  const { id } = await params;

  const where = isClientRole(role) ? { id, project: { client: { userId } } } : { id, project: { projectManagerId: userId } };
  const t = await prisma.task.findFirst({ where, include: { project: { select: { id: true, name: true } } } });
  if (!t) return (
    <ClientDashboardLayout>
      <div>Approval not found</div>
    </ClientDashboardLayout>
  );

  const item = {
    id: t.id,
    title: t.title,
    description: t.description,
    project: t.project,
    dueDate: t.dueDate,
    status: t.status === "DONE" ? "COMPLETED" : "AWAITING",
    dueDateStatus: (() => {
      if (!t.dueDate) return "normal";
      const diff = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (diff < 0 && t.status !== "DONE") return "overdue";
      if (diff <= 7) return "due-soon";
      return "normal";
    })(),
  };

  return (
    <ClientDashboardLayout>
      <ApprovalDetailPageClient item={item} />
    </ClientDashboardLayout>
  );
}
