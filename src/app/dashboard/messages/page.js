// src/app/dashboard/messages/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import MessagesPageClient from "./MessagesPageClient";

export const revalidate = 0;

export default async function ClientMessagesPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  const sp = await searchParams;
  const projectId = sp?.projectId ? String(sp.projectId) : "";
  const page = Math.max(parseInt((sp?.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt((sp?.limit ?? "20"), 10), 1), 100);
  const skip = (page - 1) * limit;

  const [projects, messages, totalCount] = await Promise.all([
    prisma.project.findMany({
      where: isClientRole(role) ? { client: { userId } } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
    prisma.activityLog.findMany({
      where: {
        AND: [
          projectId ? { projectId } : {},
          isClientRole(role)
            ? { OR: [{ project: { client: { userId } } }, { userId }] }
            : { OR: [{ project: { projectManagerId: userId } }, { userId }] },
        ],
      },
      include: { project: { select: { id: true, name: true } }, user: { select: { clerkId: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({
      where: {
        AND: [
          projectId ? { projectId } : {},
          isClientRole(role)
            ? { OR: [{ project: { client: { userId } } }, { userId }] }
            : { OR: [{ project: { projectManagerId: userId } }, { userId }] },
        ],
      },
    }),
  ]);

  const pagination = { page, limit, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / limit)) };
  const filters = { projectId };

  return (
    <ClientDashboardLayout>
      <MessagesPageClient projects={projects} messages={messages} pagination={pagination} filters={filters} />
    </ClientDashboardLayout>
  );
}
