// src/app/admin/settings/page.js
/** @module admin/settings/page */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import SettingsPageClient from "./SettingsPageClient";

export const revalidate = 0;

export default async function SettingsPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  const role = await getUserRole(userId);
  if (isClientRole(role)) redirect("/");

  const profile = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      name: true,
      email: true,
      phone: true,
      company: true,
      jobTitle: true,
      bio: true,
      timezone: true,
      language: true,
      dateFormat: true,
      timeFormat: true,
    },
  });

  const notifications = [
    { id: "email-updates", title: "Email Updates", description: "Product news and updates", enabled: true },
    { id: "invoice-reminders", title: "Invoice Reminders", description: "When invoices are due", enabled: true },
    { id: "task-mentions", title: "Task Mentions", description: "When someone mentions you", enabled: true },
  ];

  const userProjects = await prisma.project.findMany({ where: { projectManagerId: userId }, select: { id: true } });
  const projectIds = userProjects.map((p) => p.id);
  const teamUsers = await prisma.user.findMany({
    where: { OR: [{ assignedTasks: { some: { projectId: { in: projectIds } } } }, { managedProjects: { some: {} } }] },
    select: { clerkId: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
  const initialTeam = teamUsers.map((m) => ({ id: m.clerkId, name: m.name || "Unknown User", email: m.email, role: m.role, avatar: (m.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase() }));

  const sp = await searchParams;
  const tab = typeof sp?.tab === "string" ? sp.tab : "profile";
  return (
    <AdminDashboardLayout activeTab="settings">
      <SettingsPageClient
        initialProfile={profile}
        initialNotifications={notifications}
        initialTeam={initialTeam}
        initialTab={tab}
      />
    </AdminDashboardLayout>
  );
}
