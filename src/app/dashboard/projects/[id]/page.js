// src/app/dashboard/projects/[id]/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import ProjectDetailPageClient from "./ProjectDetailPageClient";

export const revalidate = 0;

export default async function ClientProjectDetailPage({ params }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  const id = params?.id;
  if (!id) return null;

  const where = isClientRole(role)
    ? { id, client: { userId } }
    : { id };

  const project = await prisma.project.findFirst({
    where,
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
        },
      },
      tasks: {
        include: {
          assignee: { select: { clerkId: true, name: true, email: true } },
          comments: {
            include: { author: { select: { clerkId: true, name: true, email: true } } },
            orderBy: { createdAt: "desc" },
          },
          timeLogs: {
            include: { user: { select: { clerkId: true, name: true, email: true } } },
            orderBy: { date: "desc" },
          },
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      },
      invoices: { orderBy: { issueDate: "desc" } },
      files: {
        include: {
          uploadedBy: { select: { clerkId: true, name: true, email: true } },
          approvals: { include: { actor: { select: { clerkId: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
        },
        orderBy: { uploadedAt: "desc" },
      },
      _count: { select: { tasks: true, invoices: true, files: true } },
    },
  });

  if (!project) return null;

  const tasksDone = project.tasks.filter((t) => t.status === "DONE").length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0;
  const teamMembers = project.tasks
    .filter((t) => t.assignee)
    .reduce((acc, t) => {
      const exists = acc.find((m) => m.clerkId === t.assignee.clerkId);
      if (!exists) acc.push(t.assignee);
      return acc;
    }, []);

  const projectWithStats = {
    ...project,
    progress,
    teamSize: teamMembers.length,
  };

  return (
    <ClientDashboardLayout>
      <ProjectDetailPageClient project={projectWithStats} />
    </ClientDashboardLayout>
  );
}

