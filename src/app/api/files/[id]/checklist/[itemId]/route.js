// src/app/api/files/[id]/checklist/[itemId]/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, getUserRole, isClientRole } from "@/lib/api-helpers";

const ALLOWED_STATUSES = new Set([
  "PENDING",
  "IN_REVIEW",
  "COMPLETE",
  "DEFERRED",
]);

/**
 * Updates a review checklist item tied to a project file.
 *
 * @param {Request} request - Incoming PATCH request with status or note updates.
 * @param {{ params: Promise<{ id: string, itemId: string }> }} context - Route context containing identifiers.
 * @returns {Promise<NextResponse>} JSON response with updated checklist entry.
 */
export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: fileId, itemId } = await params;
    const body = await request.json();
    const role = await getUserRole(userId);

    if (isClientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const checklistItem = await prisma.fileReviewChecklistItem.findFirst({
      where:
        role === "ADMIN"
          ? { id: itemId, fileId }
          : {
              id: itemId,
              fileId,
              file: { project: { projectManagerId: userId } },
            },
    });

    if (!checklistItem) {
      return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
    }

    const updates = {};
    if (body.status) {
      const normalized = body.status.toUpperCase();
      if (!ALLOWED_STATUSES.has(normalized)) {
        return NextResponse.json({ error: "Invalid checklist status" }, { status: 400 });
      }
      if (normalized === "DEFERRED" && !(body.note && body.note.trim().length > 0)) {
        return NextResponse.json({ error: "Deferment note is required" }, { status: 400 });
      }
      updates.status = normalized;
    }

    if (typeof body.note === "string") {
      const trimmedNote = body.note.trim();
      updates.note = trimmedNote.length > 0 ? trimmedNote : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates supplied" }, { status: 400 });
    }

    updates.updatedById = userId;

    const updatedItem = await prisma.fileReviewChecklistItem.update({
      where: { id: itemId },
      data: updates,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return handleApiError(error);
  }
}
