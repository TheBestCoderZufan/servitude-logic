// src/app/api/files/[id]/approve/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { handleApiError } from "@/lib/api-helpers";

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const note = body?.note || null;

    // Verify file and access
    const file = await prisma.file.findFirst({
      where: {
        id,
        OR: [
          { project: { projectManagerId: userId } },
          { project: { client: { userId } } },
        ],
      },
      include: { project: true },
    });
    if (!file)
      return NextResponse.json({ error: "File not found" }, { status: 404 });

    // Update file approval status
    const updated = await prisma.file.update({
      where: { id },
      data: {
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        approvedById: userId,
        approvals: {
          create: {
            action: "APPROVED",
            note,
            actorId: userId,
          },
        },
      },
      include: {
        approvals: {
          include: {
            actor: { select: { name: true, email: true, clerkId: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
