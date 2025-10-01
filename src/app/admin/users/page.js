// src/app/admin/users/page.js
/** @module admin/users/page */
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import UsersPageClient from "./UsersPageClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/api-helpers";
import { normalizeRole } from "@/lib/roles";
import { userSortableFields } from "@/data/page/admin/users/usersData";
import { roleFilterOptions } from "@/data/auth/roles.data";

export const revalidate = 0;
export const dynamic = "force-dynamic";

/**
 * Server-rendered admin user directory page.
 *
 * Fetches the initial dataset filtered by URL query parameters before handing
 * off to the interactive client component.
 *
 * @param {{ searchParams: Record<string, string|undefined> }} context - Route context.
 * @returns {Promise<JSX.Element>} Rendered page.
 */
export default async function AdminUsersPage({ searchParams }) {
  const sp = await searchParams;

  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const role = await getUserRole(userId);
  if (normalizeRole(role) !== "ADMIN") {
    redirect("/dashboard");
  }

  const page = Math.max(Number.parseInt(sp?.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(sp?.limit || "10", 10) || 10, 1), 100);
  const search = typeof sp?.search === "string" ? sp.search : "";
  const roleFilter = typeof sp?.role === "string" ? sp.role : "ALL";
  const sortByCandidate = typeof sp?.sortBy === "string" ? sp.sortBy : "createdAt";
  const sortBy = userSortableFields.includes(sortByCandidate) ? sortByCandidate : "createdAt";
  const sortOrder = sp?.sortOrder === "asc" ? "asc" : "desc";
  const skip = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (roleFilter && roleFilter !== "ALL") {
    const normalized = normalizeRole(roleFilter);
    whereClause.role = normalized;
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

  const initialUsers = users.map((user) => {
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
  const pagination = {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  const sort = {
    sortBy,
    sortOrder,
  };

  const allowedRoles = new Set(roleFilterOptions.map((option) => option.value));
  const initialRole = allowedRoles.has(roleFilter) ? roleFilter : "ALL";

  return (
    <AdminDashboardLayout activeTab="users">
      <UsersPageClient
        initialUsers={initialUsers}
        initialPagination={pagination}
        initialSort={sort}
        initialSearch={search}
        initialRole={initialRole}
        initialLimit={limit}
      />
    </AdminDashboardLayout>
  );
}
