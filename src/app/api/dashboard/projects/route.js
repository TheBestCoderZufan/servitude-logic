// src/app/api/dashboard/projects/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit")) || 5;

    if (userIdParam !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const role = await getUserRole(userId);
    const where = role === "ADMIN" ? {} : { projectManagerId: userId };
    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching recent projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent projects" },
      { status: 500 }
    );
  }
}
