// src/app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  getPaginationParams,
  handleApiError,
  getUserRole,
} from "@/lib/api-helpers";
import { hasRolePrivilege, normalizeRole } from "@/lib/roles";

const ORDERABLE_FIELDS = new Set(["name", "email", "role", "createdAt", "updatedAt"]);

/**
 * GET
 * Returns a paginated list of users for the admin directory, filtered by search
 * term, role, and sorted according to the provided query parameters.
 *
 * @param {Request} request - Incoming Next.js request.
 * @returns {Promise<NextResponse>} JSON response with users and pagination data.
 */
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actorRole = await getUserRole(userId);
    if (!hasRolePrivilege(actorRole || "", "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "ALL";
    const sortByCandidate = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const sortBy = ORDERABLE_FIELDS.has(sortByCandidate) ? sortByCandidate : "createdAt";

    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleFilter && roleFilter !== "ALL") {
      whereClause.role = normalizeRole(roleFilter);
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const userIds = users.map((user) => user.clerkId);
    const clientProfiles = userIds.length
      ? await prisma.client.findMany({
          where: { userId: { in: userIds } },
          select: { id: true, companyName: true, userId: true },
        })
      : [];

    const clientMap = new Map(clientProfiles.map((client) => [client.userId, client]));

    const items = users.map((user) => {
      const clientProfile = clientMap.get(user.clerkId);
      return {
        id: user.clerkId,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        client: clientProfile
          ? {
              id: clientProfile.id,
              companyName: clientProfile.companyName,
            }
          : null,
      };
    });

    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    return NextResponse.json({
      users: items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      sort: {
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
