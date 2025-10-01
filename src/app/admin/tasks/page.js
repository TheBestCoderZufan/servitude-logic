// src/app/admin/tasks/page.js
/** @module admin/tasks/page */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import TasksPageClient from "./TasksPageClient";

export const revalidate = 0;

/**
 * Server-rendered Tasks page. Fetches the initial task list and stats
 * with Prisma and hydrates a client island for interactivity.
 * @param {{ searchParams: Record<string,string|undefined> }} ctx
 */
export default async function TasksPage({ searchParams }) {
  const sp = await searchParams;
  const { userId } = await auth();
  if (!userId) redirect("/");
  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  // Parse filters
  const page = Math.max(parseInt((sp?.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt((sp?.limit ?? "50"), 10), 1), 100);
  const skip = (page - 1) * limit;
  const search = typeof sp?.search === "string" ? sp.search : "";
  const status = typeof sp?.status === "string" ? sp.status : "all";
  const priority = typeof sp?.priority === "string" ? sp.priority : "all";
  const projectId = typeof sp?.projectId === "string" ? sp.projectId : undefined;
  const assigneeId = typeof sp?.assigneeId === "string" ? sp.assigneeId : undefined;
  const dueDate = typeof sp?.dueDate === "string" ? sp.dueDate : undefined;

  // Build where clause according to API logic
  const whereClause = {
    OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }],
  };
  if (search) {
    whereClause.AND = whereClause.AND || [];
    whereClause.AND.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { project: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }
  if (status && status !== "all") {
    whereClause.AND = whereClause.AND || [];
    whereClause.AND.push({ status: status.toUpperCase() });
  }
  if (priority && priority !== "all") {
    whereClause.AND = whereClause.AND || [];
    whereClause.AND.push({ priority: priority.toUpperCase() });
  }
  if (projectId) {
    whereClause.AND = whereClause.AND || [];
    whereClause.AND.push({ projectId });
  }
  if (assigneeId) {
    whereClause.AND = whereClause.AND || [];
    whereClause.AND.push({ assigneeId });
  }
  if (dueDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dueFilters = {
      overdue: { dueDate: { lt: today }, status: { not: "DONE" } },
      today: { dueDate: { gte: today, lt: tomorrow } },
      week: { dueDate: { gte: today, lte: weekFromNow } },
      month: { dueDate: { gte: today, lte: monthFromNow } },
    };
    if (dueFilters[dueDate]) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push(dueFilters[dueDate]);
    }
  }

  // Query tasks + count
  const [tasksRaw, totalCount] = await Promise.all([
    prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            client: { select: { id: true, companyName: true } },
          },
        },
        assignee: { select: { clerkId: true, name: true, email: true } },
        _count: { select: { comments: true, timeLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.task.count({ where: whereClause }),
  ]);

  // Enrich with stats similar to API
  const tasks = await Promise.all(
    tasksRaw.map(async (task) => {
      const totalHoursAgg = await prisma.timeLog.aggregate({ where: { taskId: task.id }, _sum: { hours: true } });
      const totalHours = totalHoursAgg._sum.hours || 0;
      const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== "DONE" : false;
      let dueDateStatus = "normal";
      if (task.dueDate) {
        const now2 = new Date();
        const due = new Date(task.dueDate);
        const diffDays = Math.ceil((due - now2) / (1000 * 60 * 60 * 24));
        if (diffDays < 0 && task.status !== "DONE") dueDateStatus = "overdue";
        else if (diffDays === 0) dueDateStatus = "due-today";
        else if (diffDays <= 3) dueDateStatus = "due-soon";
      }
      return {
        ...task,
        totalHours,
        isOverdue,
        dueDateStatus,
        daysUntilDue: task.dueDate ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      };
    })
  );

  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Header stats (scoped to user)
  const [totalTasks, inProgress, completed, overdue] = await Promise.all([
    prisma.task.count({ where: { OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }] } }),
    prisma.task.count({ where: { OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }], status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }], status: "DONE" } }),
    prisma.task.count({ where: { OR: [{ assigneeId: userId }, { project: { projectManagerId: userId } }], dueDate: { lt: new Date() }, status: { not: "DONE" } } }),
  ]);

  const stats = { total: totalTasks, inProgress, completed, overdue };

  return (
    <AdminDashboardLayout activeTab="tasks">
      <TasksPageClient
        initialTasks={tasks}
        initialStats={stats}
        initialSearch={search}
        initialStatus={status}
        initialPriority={priority}
        initialProject={"all"}
        initialAssignee={"all"}
      />
    </AdminDashboardLayout>
  );
}
