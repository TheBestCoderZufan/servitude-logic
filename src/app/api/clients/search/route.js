// src/app/api/clients/search/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 50);

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const clients = await prisma.client.findMany({
      where: {
        projects: {
          some: {
            projectManagerId: userId,
          },
        },
        OR: [
          { companyName: { contains: query, mode: "insensitive" } },
          { contactName: { contains: query, mode: "insensitive" } },
          { contactEmail: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        contactEmail: true,
      },
      take: limit,
      orderBy: {
        companyName: "asc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error searching clients:", error);
    return NextResponse.json(
      { error: "Failed to search clients" },
      { status: 500 }
    );
  }
}
