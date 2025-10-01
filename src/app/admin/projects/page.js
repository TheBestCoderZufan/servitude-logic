// src/app/admin/projects/page.js
/** @module admin/projects/page */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import ProjectsPageClient from "./ProjectsPageClient";

export const revalidate = 0;

/**
 * Server-rendered projects page with SSR data and a client island for UX.
 * @param {{ searchParams: Record<string,string|undefined> }} ctx
 */
export default async function ProjectsPage({ searchParams }) {
  const sp = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/");
  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  // Parse filters
  const page = Math.max(parseInt((sp?.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt((sp?.limit ?? "12"), 10), 1), 100);
  const skip = (page - 1) * limit;
  const search = typeof sp?.search === "string" ? sp.search : "";
  const status = typeof sp?.status === "string" ? sp.status : "all";
  const priority = typeof sp?.priority === "string" ? sp.priority : "all";

  // Determine scope based on role (admins/PMs see all, others see managed)
  let whereClause = {};
  if (!(role === "ADMIN" || role === "PROJECT_MANAGER")) {
    whereClause = { projectManagerId: userId };
  }

  if (search) {
    whereClause = {
      ...whereClause,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { client: { companyName: { contains: search, mode: "insensitive" } } },
      ],
    };
  }
  if (status && status !== "all") whereClause = { ...whereClause, status: status.toUpperCase() };
  // priority not modeled at project level; ignored for now

  const [projectsRaw, totalCount] = await Promise.all([
    prisma.project.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, companyName: true, contactName: true, contactEmail: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignee: { select: { clerkId: true, name: true, email: true } },
          },
        },
        invoices: { select: { id: true, amount: true, status: true } },
        files: { select: { id: true, fileName: true, fileType: true, url: true, uploadedAt: true } },
        _count: { select: { tasks: true, invoices: true, files: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.project.count({ where: whereClause }),
  ]);

  const projects = projectsRaw.map((project) => {
    const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
    const totalTasks = project.tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalBudget = project.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = project.invoices.filter((inv) => inv.status === "PAID").reduce((sum, inv) => sum + inv.amount, 0);
    const teamMembers = project.tasks
      .filter((task) => task.assignee)
      .reduce((acc, task) => {
        const exists = acc.find((m) => m.clerkId === task.assignee.clerkId);
        if (!exists) acc.push(task.assignee);
        return acc;
      }, []);
    return {
      ...project,
      progress,
      completedTasks,
      totalBudget,
      paidAmount,
      teamSize: teamMembers.length,
      teamMembers: teamMembers.slice(0, 5),
      isOverdue: project.endDate && new Date(project.endDate) < new Date() && project.status !== "COMPLETED",
    };
  });

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const pagination = { page, limit, totalCount, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };

  // Stats (mirror API logic scoped by role)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [totalProjects, projectsByStatus, projectsThisMonth, projectsLastMonth, overdueProjects, totalRevenueAgg, completedForAvg] = await Promise.all([
    prisma.project.count({ where: whereClause }),
    prisma.project.groupBy({ by: ["status"], where: whereClause, _count: { status: true } }),
    prisma.project.count({ where: { ...whereClause, createdAt: { gte: startOfMonth } } }),
    prisma.project.count({ where: { ...whereClause, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.project.count({ where: { ...whereClause, endDate: { lt: now }, status: { not: "COMPLETED" } } }),
    prisma.invoice.aggregate({ where: { project: whereClause, status: "PAID" }, _sum: { amount: true } }),
    prisma.project.findMany({ where: { ...whereClause, status: "COMPLETED" }, select: { startDate: true, endDate: true } }),
  ]);

  const statusCounts = { PLANNING: 0, IN_PROGRESS: 0, COMPLETED: 0, ON_HOLD: 0, CANCELLED: 0 };
  projectsByStatus.forEach((item) => { statusCounts[item.status] = item._count.status; });
  let avgDuration = 0;
  if (completedForAvg.length > 0) {
    const totalDays = completedForAvg.reduce((sum, p) => sum + Math.ceil((new Date(p.endDate) - new Date(p.startDate)) / (1000*60*60*24)), 0);
    avgDuration = Math.round(totalDays / completedForAvg.length);
  }
  const stats = {
    totalProjects,
    projectsByStatus: statusCounts,
    newProjectsThisMonth: projectsThisMonth,
    projectGrowth: projectsThisMonth - projectsLastMonth,
    overdueProjects,
    totalRevenue: totalRevenueAgg._sum.amount || 0,
    averageProjectDuration: avgDuration,
    activeProjects: statusCounts.PLANNING + statusCounts.IN_PROGRESS,
    completionRate: totalProjects > 0 ? Math.round((statusCounts.COMPLETED / totalProjects) * 100) : 0,
  };

  return (
    <AdminDashboardLayout activeTab="projects">
      <ProjectsPageClient
        initialProjects={projects}
        initialPagination={pagination}
        initialStats={stats}
        initialSearch={search}
        initialStatus={status}
        initialPriority={priority}
        initialPage={page}
        initialLimit={limit}
      />
    </AdminDashboardLayout>
  );
}
