// src/app/dashboard/invoices/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import InvoicesPageClient from "./InvoicesPageClient";

export const revalidate = 0;

export default async function ClientInvoicesPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);

  const sp = await searchParams;
  const page = Math.max(parseInt((sp?.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt((sp?.limit ?? "20"), 10), 1), 100);
  const skip = (page - 1) * limit;
  const search = (sp?.search || "").toString();
  const status = (sp?.status || "all").toString();
  const projectId = sp?.projectId && sp.projectId !== "all" ? String(sp.projectId) : undefined;
  const sortByRaw = (sp?.sortBy || "issueDate").toString();
  const sortOrderRaw = (sp?.sortOrder || "desc").toString().toLowerCase();
  const sortable = new Set(["issueDate", "dueDate", "amount", "status"]);
  const sortBy = sortable.has(sortByRaw) ? sortByRaw : "issueDate";
  const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";
  const orderBy = { [sortBy]: sortOrder };

  const where = {
    ...(isClientRole(role) ? { project: { client: { userId } } } : {}),
    ...(projectId ? { projectId } : {}),
  };
  if (status && status !== "all") where.status = status.toUpperCase();
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { project: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [invoices, totalCount] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  const pagination = {
    page,
    limit,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  };
  const filters = { search, status, sortBy, sortOrder, projectId };

  return (
    <ClientDashboardLayout>
      <InvoicesPageClient invoices={invoices} pagination={pagination} filters={filters} />
    </ClientDashboardLayout>
  );
}
