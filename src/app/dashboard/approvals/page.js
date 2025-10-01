// src/app/dashboard/approvals/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import ApprovalsPageClient from "./ApprovalsPageClient";

export const revalidate = 0;

export default async function ApprovalsPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);

  const sp = await searchParams;
  const projectId = sp?.projectId && sp.projectId !== "all" ? String(sp.projectId) : undefined;
  const search = (sp?.search || "").toString();
  const statusFilter = (sp?.status || "all").toString();

  const where = {
    project: isClientRole(role) ? { client: { userId } } : { projectManagerId: userId },
  };
  if (projectId) where.project = { ...where.project, id: projectId };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { project: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { project: { select: { id: true, name: true } } },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    take: 100,
  });

  const items = tasks
    .map((t) => ({
      id: t.id,
      title: t.title,
      project: t.project,
      requestedDate: t.createdAt,
      dueDate: t.dueDate,
      rawStatus: t.status,
      status: t.status === "DONE" ? "COMPLETED" : "AWAITING",
      dueDateStatus: (() => {
        if (!t.dueDate) return "normal";
        const diff = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0 && t.status !== "DONE") return "overdue";
        if (diff <= 7) return "due-soon";
        return "normal";
      })(),
    }))
    .filter((i) => (statusFilter === "all" ? true : statusFilter === "AWAITING" ? i.status === "AWAITING" : i.status === "COMPLETED"));

  return (
    <ClientDashboardLayout>
      <ApprovalsPageClient items={items} filters={{ search, status: statusFilter, projectId }} />
    </ClientDashboardLayout>
  );
}
