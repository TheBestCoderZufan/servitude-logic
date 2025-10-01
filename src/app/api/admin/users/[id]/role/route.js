// src/app/api/admin/users/[id]/role/route.js
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/api-helpers";
import { hasRolePrivilege, normalizeRole, roleToMetadata } from "@/lib/roles";
import {
  pickEmail,
  ensureUserRecord,
  ensureClientForRole,
  removeClientForUser,
  ensureMetadataRole,
} from "@/lib/userSync";
import { roleHierarchy } from "@/data/auth/roles.data";

/**
 * PATCH
 * Updates a user's role, synchronizing Clerk metadata and the local database.
 *
 * @param {Request} request - Incoming Next.js request containing `{ role }` JSON payload.
 * @param {Object} context - Route context with params.
 * @returns {Promise<NextResponse>} JSON response with the updated user summary.
 */
export async function PATCH(request, context) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actorRole = await getUserRole(userId);
    if (!hasRolePrivilege(actorRole || "", "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const submittedRole = typeof body?.role === "string" ? body.role : "";
    const normalizedRole = normalizeRole(submittedRole);

    if (!roleHierarchy.includes(normalizedRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const params = await context.params;
    const { id } = params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const clerkC = await clerkClient();
    const clerkUser = await clerkC.users.getUser(id);
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = pickEmail(clerkUser);
    const name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    await ensureMetadataRole(
      id,
      normalizedRole,
      clerkUser.publicMetadata?.role
    );
    await ensureUserRecord({ clerkId: id, email, name, role: normalizedRole });

    if (normalizedRole === "CLIENT") {
      await ensureClientForRole({ clerkId: id, name, email });
    } else {
      await removeClientForUser(id);
    }

    return NextResponse.json({
      id,
      role: normalizedRole,
      metadataRole: roleToMetadata(normalizedRole),
    });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 400 }
    );
  }
}
