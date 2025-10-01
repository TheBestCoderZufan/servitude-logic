// src/app/dashboard/files/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import FilesPageClient from "./FilesPageClient";

export const revalidate = 0;

export default async function ClientFilesPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);

  const sp = await searchParams;
  const page = Math.max(parseInt((sp?.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt((sp?.limit ?? "20"), 10), 1), 100);
  const skip = (page - 1) * limit;
  const search = (sp?.search || "").toString();
  const status = (sp?.status || "all").toString();
  const scope = (sp?.scope || "project").toString();
  const sortByRaw = (sp?.sortBy || "uploadedAt").toString();
  const sortOrderRaw = (sp?.sortOrder || "desc").toString().toLowerCase();
  const projectId = sp?.projectId && sp.projectId !== "all" ? String(sp.projectId) : undefined;

  const sortable = new Set(["uploadedAt", "fileName", "approvalStatus"]);
  const sortBy = sortable.has(sortByRaw) ? sortByRaw : "uploadedAt";
  const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";
  const orderBy = { [sortBy]: sortOrder };

  const where = {
    project: isClientRole(role) ? { client: { userId } } : {},
  };
  if (scope !== "all" && projectId) where.project = { ...where.project, id: projectId };
  if (search) {
    where.OR = [
      { fileName: { contains: search, mode: "insensitive" } },
      { fileType: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status !== "all") where.approvalStatus = status.toUpperCase();

  const [files, totalCount] = await Promise.all([
    prisma.file.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.file.count({ where }),
  ]);

  const pagination = { page, limit, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / limit)) };
  const filters = { search, status, scope, sortBy, sortOrder, projectId };

  return (
    <ClientDashboardLayout>
      <FilesPageClient files={files} pagination={pagination} filters={filters} />
    </ClientDashboardLayout>
  );
}
