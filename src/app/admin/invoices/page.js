// src/app/admin/invoices/page.js
/** @module admin/invoices/page */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import InvoicesPageClient from "./InvoicesPageClient";

export const revalidate = 0;

export default async function InvoicesPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  // Parse filters from URL
  const sp = await searchParams;
  const search = typeof sp?.search === "string" ? sp.search : "";
  const status = typeof sp?.status === "string" ? sp.status : "all";
  const client = typeof sp?.client === "string" ? sp.client : "all";
  const date = typeof sp?.date === "string" ? sp.date : "all";

  // Pagination + sorting
  const page = Math.max(parseInt((sp?.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt((sp?.limit ?? "20"), 10), 1), 100);
  const skip = (page - 1) * limit;
  const sortByParam = (sp?.sortBy || "issueDate").toString();
  const sortOrderParam = (sp?.sortOrder || "desc").toString().toLowerCase() === "asc" ? "asc" : "desc";
  const SORT_WHITELIST = {
    issueDate: "issueDate",
    dueDate: "dueDate",
    amount: "amount",
    status: "status",
    invoiceNumber: "invoiceNumber",
  };
  const sortKey = SORT_WHITELIST[sortByParam] || "issueDate";
  const orderBy = { [sortKey]: sortOrderParam };

  const whereClause = {
    project: { projectManagerId: userId },
  };

  if (search) {
    whereClause.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { project: { name: { contains: search, mode: "insensitive" } } },
      { project: { client: { companyName: { contains: search, mode: "insensitive" } } } },
    ];
  }
  if (status && status !== "all") {
    whereClause.status = status.toUpperCase();
  }
  if (client && client !== "all") {
    whereClause.project = {
      ...whereClause.project,
      client: { companyName: client },
    };
  }
  if (date && date !== "all") {
    const now = new Date();
    let startDate, endDate;
    switch (date) {
      case "this-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "this-quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        endDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        break;
      case "this-year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        break;
    }
    if (startDate && endDate) {
      whereClause.issueDate = { gte: startDate, lte: endDate };
    }
  }

  const [invoices, totalCount] = await Promise.all([
    prisma.invoice.findMany({
      where: whereClause,
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
                contactEmail: true,
                contactPhone: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.invoice.count({ where: whereClause }),
  ]);

  const now = new Date();
  const stats = {
    totalRevenue: invoices
      .filter((i) => i.status === "PAID")
      .reduce((s, i) => s + i.amount, 0),
    outstanding: invoices
      .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
      .reduce((s, i) => s + i.amount, 0),
    paidInvoices: invoices.filter((i) => i.status === "PAID").length,
    overdue: invoices.filter((i) => i.status === "SENT" && i.dueDate && new Date(i.dueDate) < now).length,
  };
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const pagination = {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
  const initialSort = { sortBy: sortKey, sortOrder: sortOrderParam };

  return (
    <AdminDashboardLayout activeTab="invoices">
      <InvoicesPageClient
        initialInvoices={invoices}
        initialStats={stats}
        initialSearch={search}
        initialStatus={status}
        initialClient={client}
        initialDate={date}
        initialPagination={pagination}
        initialSort={initialSort}
      />
    </AdminDashboardLayout>
  );
}
