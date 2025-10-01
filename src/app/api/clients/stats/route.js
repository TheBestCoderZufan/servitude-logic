// src/app/api/clients/stats/route.js
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

    const [
      totalClients,
      activeClients,
      clientsThisMonth,
      clientsLastMonth,
      totalRevenue,
    ] = await Promise.all([
      // Total clients
      prisma.client.count({
        where: {
          projects: {
            some: {
              projectManagerId: userId,
            },
          },
        },
      }),

      // Active clients (with active projects)
      prisma.client.count({
        where: {
          projects: {
            some: {
              projectManagerId: userId,
              status: {
                in: ["PLANNING", "IN_PROGRESS"],
              },
            },
          },
        },
      }),

      // Clients added this month
      prisma.client.count({
        where: {
          projects: {
            some: {
              projectManagerId: userId,
            },
          },
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),

      // Clients added last month
      prisma.client.count({
        where: {
          projects: {
            some: {
              projectManagerId: userId,
            },
          },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),

      // Total revenue from all clients
      prisma.invoice.aggregate({
        where: {
          project: {
            projectManagerId: userId,
          },
          status: "PAID",
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const stats = {
      totalClients,
      activeClients,
      newClientsThisMonth: clientsThisMonth,
      clientGrowth: clientsThisMonth - clientsLastMonth,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageProjectValue:
        totalClients > 0
          ? Math.round((totalRevenue._sum.amount || 0) / totalClients)
          : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching client stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch client statistics" },
      { status: 500 }
    );
  }
}
