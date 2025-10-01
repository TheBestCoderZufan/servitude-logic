// src/app/admin/clients/page.js
/** @module admin/clients/page */
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientsPageClient from "./ClientsPageClient";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

/**
 * Server-rendered Clients page.
 *
 * Fetches initial data via Prisma with role scoping and passes it to a
 * small client island for interactivity (modals, dropdowns, toasts).
 *
 * @param {{ searchParams: Record<string, string|undefined> }} ctx - Route context
 * @returns {Promise<JSX.Element>} Rendered page
 */
export default async function ClientsPage({ searchParams }) {
  const sp = await searchParams;

  // AuthN/AuthZ
  const { userId } = await auth();
  if (!userId) redirect("/");
  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  // Parse query
  const page = Math.max(parseInt((sp?.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt((sp?.limit ?? "10"), 10), 1), 100);
  const skip = (page - 1) * limit;
  const search = typeof sp?.search === "string" ? sp.search : "";
  const status = typeof sp?.status === "string" ? sp.status : "all";

  // Build where clause
  const clientWhere = {};
  if (search) {
    clientWhere.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { contactName: { contains: search, mode: "insensitive" } },
      { contactEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const projectsFilter = { projectManagerId: userId };

  // List and count
  const [rawClients, totalCount] = await Promise.all([
    prisma.client.findMany({
      where: clientWhere,
      include: {
        projects: {
          where: projectsFilter,
          select: { id: true, name: true, status: true, createdAt: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        },
        _count: { select: { projects: { where: projectsFilter } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.client.count({ where: clientWhere }),
  ]);

  const clients = await Promise.all(
    rawClients.map(async (client) => {
      const activeProjects = client.projects.filter((p) => ["PLANNING", "IN_PROGRESS"].includes(p.status)).length;
      const revenueAgg = await prisma.invoice.aggregate({
        where: { project: { clientId: client.id, projectManagerId: userId }, status: "PAID" },
        _sum: { amount: true },
      });
      const lastContact = client.projects.length ? client.projects[0].updatedAt : client.createdAt;
      return {
        ...client,
        activeProjects,
        totalRevenue: revenueAgg._sum.amount || 0,
        lastContact,
        status: activeProjects > 0 ? "active" : "inactive",
      };
    })
  );

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const pagination = {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  // Header stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [totalClients, activeClients, clientsThisMonth, clientsLastMonth, totalRevenueAgg] = await Promise.all([
    prisma.client.count({ where: { projects: { some: { projectManagerId: userId } } } }),
    prisma.client.count({ where: { projects: { some: { projectManagerId: userId, status: { in: ["PLANNING", "IN_PROGRESS"] } } } } }),
    prisma.client.count({ where: { projects: { some: { projectManagerId: userId } }, createdAt: { gte: startOfMonth } } }),
    prisma.client.count({ where: { projects: { some: { projectManagerId: userId } }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.invoice.aggregate({ where: { project: { projectManagerId: userId }, status: "PAID" }, _sum: { amount: true } }),
  ]);

  const stats = {
    totalClients,
    activeClients,
    newClientsThisMonth: clientsThisMonth,
    totalRevenue: totalRevenueAgg._sum.amount || 0,
  };

  return (
    <AdminDashboardLayout activeTab="clients">
      <ClientsPageClient
        initialClients={clients}
        initialPagination={pagination}
        initialStats={stats}
        initialPage={page}
        initialLimit={limit}
        initialSearch={search}
        initialStatus={status}
      />
    </AdminDashboardLayout>
  );
}
