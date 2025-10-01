// src/app/api/projects/search/route.js
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
    const status = searchParams.get("status");

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const whereClause = {
      projectManagerId: userId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        {
          client: {
            companyName: { contains: query, mode: "insensitive" },
          },
        },
      ],
    };

    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        status: true,
        client: {
          select: {
            companyName: true,
          },
        },
      },
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error searching projects:", error);
    return NextResponse.json(
      { error: "Failed to search projects" },
      { status: 500 }
    );
  }
}
