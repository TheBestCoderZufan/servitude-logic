// src/app/admin/clients/[id]/page.js
/** @module admin/clients/[id]/page */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import ClientDetailPageClient from "./ClientDetailPageClient";

export const revalidate = 0;

export default async function AdminClientDetailPage({ params, searchParams }) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id },
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          projectManager: { select: { name: true } },
          tasks: { select: { id: true, status: true } },
          invoices: { select: { id: true, amount: true, status: true } },
          activities: { select: { id: true, text: true, type: true, createdAt: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { projects: true } },
    },
  });
  if (!client) redirect("/admin/clients");

  const activeProjects = client.projects.filter((p) => ["PLANNING", "IN_PROGRESS"].includes(p.status)).length;
  const totalRevenue = client.projects.reduce((sum, p) => sum + p.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0), 0);
  const totalTasks = client.projects.reduce((s, p) => s + p.tasks.length, 0);
  const completedTasks = client.projects.reduce((s, p) => s + p.tasks.filter((t) => t.status === "DONE").length, 0);
  const clientWithStats = { ...client, activeProjects, totalRevenue, totalTasks, completedTasks };

  const invoices = await prisma.invoice.findMany({ where: { project: { clientId: id } }, orderBy: { createdAt: "desc" }, take: 50 });
  const sp = await searchParams;
  const tab = typeof sp?.tab === "string" ? sp.tab : "overview";

  return (
    <AdminDashboardLayout activeTab="clients">
      <ClientDetailPageClient initialClient={clientWithStats} initialInvoices={invoices} initialTab={tab} />
    </AdminDashboardLayout>
  );
}
