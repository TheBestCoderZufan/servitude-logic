// src/app/dashboard/projects/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import ProjectsPageClient from "./ProjectsPageClient";

export const revalidate = 0;

/**
 * Projects list (Server Component)
 * - SSR filters via searchParams: search, status, sortBy, sortOrder, page, limit
 * - SSR pagination and sorting
 */
export default async function ClientProjectsPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  const clientScope = isClientRole(role);

  const sp = await searchParams;
  const page = Math.max(parseInt((sp?.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt((sp?.limit ?? "12"), 10), 1), 50);
  const skip = (page - 1) * limit;
  const search = (sp?.search || "").toString();
  const status = (sp?.status || "all").toString();
  const sortByRaw = (sp?.sortBy || "updatedAt").toString();
  const sortOrderRaw = (sp?.sortOrder || "desc").toString().toLowerCase();
  const intakeSubmitted = sp?.submitted === "1";

  // Whitelist sorting columns to avoid injection
  const sortable = new Set(["updatedAt", "createdAt", "name", "status"]);
  const sortBy = sortable.has(sortByRaw) ? sortByRaw : "updatedAt";
  const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";
  const orderBy = { [sortBy]: sortOrder };

  const where = clientScope ? { client: { userId } } : {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { client: { companyName: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status && status !== "all") where.status = status.toUpperCase();

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true }, take: 500 },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  /**
   * Pending intake submissions awaiting triage before they become full
   * projects. Shown to clients so they receive immediate feedback after
   * submitting a request.
   * @type {Array<{id: string, status: string, submittedAt: string, projectName: string, summary: string, budgetRange: string|null, targetLaunch: string|null}>}
   */
  let pendingIntakes = [];

  if (clientScope) {
    const clientRecord = await prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (clientRecord) {
      const rawPendingIntakes = await prisma.intake.findMany({
        where: {
          clientId: clientRecord.id,
          projectId: null,
          status: { not: "ARCHIVED" },
        },
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          summary: true,
          formData: true,
        },
      });

      pendingIntakes = rawPendingIntakes.map((intake) => {
        const formData =
          intake.formData && typeof intake.formData === "object" && !Array.isArray(intake.formData)
            ? /** @type {Record<string, unknown>} */ (intake.formData)
            : {};

        const projectNameRaw = formData.projectName;
        const projectName =
          typeof projectNameRaw === "string" && projectNameRaw.trim().length > 0
            ? projectNameRaw.trim()
            : "Pending intake request";

        const projectSummary =
          typeof intake.summary === "string" && intake.summary.trim().length > 0
            ? intake.summary.trim()
            : typeof formData.goalStatement === "string"
              ? formData.goalStatement.trim()
              : "";

        return {
          id: intake.id,
          status: intake.status,
          submittedAt: intake.submittedAt.toISOString(),
          projectName,
          summary: projectSummary,
          budgetRange:
            typeof formData.budgetRange === "string" && formData.budgetRange.trim().length > 0
              ? formData.budgetRange.trim()
              : null,
          targetLaunch:
            typeof formData.targetLaunch === "string" && formData.targetLaunch.trim().length > 0
              ? formData.targetLaunch.trim()
              : null,
        };
      });
    }
  }

  const withDerived = projects.map((p) => ({
    ...p,
    tasksDone: p.tasks?.filter((t) => t.status === "DONE").length || 0,
  }));

  const pagination = {
    page,
    limit,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  };

  const filters = { search, status, sortBy, sortOrder };

  return (
    <ClientDashboardLayout>
      <ProjectsPageClient
        projects={withDerived}
        pagination={pagination}
        filters={filters}
        intakeSubmitted={intakeSubmitted}
        pendingIntakes={pendingIntakes}
      />
    </ClientDashboardLayout>
  );
}
/** @module dashboard/projects/page */
