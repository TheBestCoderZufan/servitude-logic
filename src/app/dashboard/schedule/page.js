// src/app/dashboard/schedule/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import SchedulePageClient from "./SchedulePageClient";

export const revalidate = 0;

export default async function SchedulePage() {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  const projects = await prisma.project.findMany({
    where: isClientRole(role) ? { client: { userId } } : {},
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 100,
  });

  return (
    <ClientDashboardLayout>
      <SchedulePageClient projects={projects} />
    </ClientDashboardLayout>
  );
}

