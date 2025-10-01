// src/app/api/invoices/stats/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalInvoices,
      invoicesByStatus,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      yearlyRevenue,
      overdueInvoices,
      averageInvoiceValue,
      outstandingAmount,
    ] = await Promise.all([
      // Total invoices
      prisma.invoice.count({
        where: {
          project: { projectManagerId: userId },
        },
      }),

      // Invoices by status
      prisma.invoice.groupBy({
        by: ["status"],
        where: {
          project: { projectManagerId: userId },
        },
        _count: {
          status: true,
        },
      }),

      // Total revenue (all paid invoices)
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: "PAID",
        },
        _sum: { amount: true },
      }),

      // Monthly revenue
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: "PAID",
          issueDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),

      // Last month revenue
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: "PAID",
          issueDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),

      // Yearly revenue
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: "PAID",
          issueDate: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),

      // Overdue invoices
      prisma.invoice.count({
        where: {
          project: { projectManagerId: userId },
          status: "SENT",
          dueDate: { lt: now },
        },
      }),

      // Average invoice value
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
        },
        _avg: { amount: true },
      }),

      // Outstanding amount (sent + overdue)
      prisma.invoice.aggregate({
        where: {
          project: { projectManagerId: userId },
          status: { in: ["SENT", "OVERDUE"] },
        },
        _sum: { amount: true },
      }),
    ]);

    // Format status counts
    const statusCounts = {
      DRAFT: 0,
      SENT: 0,
      PAID: 0,
      OVERDUE: 0,
    };

    invoicesByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });

    // Calculate growth
    const currentRevenue = monthlyRevenue._sum.amount || 0;
    const previousRevenue = lastMonthRevenue._sum.amount || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? Math.round(
            ((currentRevenue - previousRevenue) / previousRevenue) * 100
          )
        : currentRevenue > 0
        ? 100
        : 0;

    const stats = {
      totalInvoices,
      invoicesByStatus: statusCounts,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: currentRevenue,
      yearlyRevenue: yearlyRevenue._sum.amount || 0,
      revenueGrowth,
      overdueInvoices,
      averageInvoiceValue: Math.round(averageInvoiceValue._avg.amount || 0),
      outstandingAmount: outstandingAmount._sum.amount || 0,
      collectionRate:
        totalInvoices > 0
          ? Math.round((statusCounts.PAID / totalInvoices) * 100)
          : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice statistics" },
      { status: 500 }
    );
  }
}
