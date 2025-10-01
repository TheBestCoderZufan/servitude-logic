// src/app/api/files/[id]/annotations/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, getUserRole, isClientRole } from "@/lib/api-helpers";

/**
 * Creates a new inline annotation for the specified project file.
 *
 * @param {Request} request - Incoming POST request with annotation payload.
 * @param {{ params: Promise<{ id: string }> }} context - Route context containing file params.
 * @returns {Promise<NextResponse>} JSON response with the persisted annotation.
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    if (comment.length === 0) {
      return NextResponse.json({ error: "Annotation comment is required" }, { status: 400 });
    }

    const role = await getUserRole(userId);
    const accessibleFile = await prisma.file.findFirst({
      where: isClientRole(role)
        ? { id, project: { client: { userId } } }
        : {
            id,
            project: {
              OR: [
                { projectManagerId: userId },
                { client: { userId } },
              ],
            },
          },
      select: { id: true },
    });

    if (!accessibleFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const annotation = await prisma.fileAnnotation.create({
      data: {
        fileId: id,
        authorId: userId,
        page: typeof body.page === "number" ? body.page : null,
        position: typeof body.position === "object" && body.position !== null ? body.position : null,
        comment,
      },
      include: {
        author: { select: { clerkId: true, name: true, email: true } },
      },
    });

    return NextResponse.json(annotation, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
