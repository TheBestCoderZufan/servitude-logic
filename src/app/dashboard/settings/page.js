// src/app/dashboard/settings/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import ClientSettingsPageClient from "./ClientSettingsPageClient";

export const revalidate = 0;

export default async function ClientSettingsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const profile = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { name: true, email: true, phone: true, timezone: true },
  });
  const [firstName = "", lastName = ""] = (profile?.name || "").split(" ");
  const initialProfile = {
    firstName,
    lastName,
    email: profile?.email || "",
    phone: profile?.phone || "",
    timezone: profile?.timezone || "America/New_York",
  };
  const initialNotifications = [
    { id: "email-updates", title: "Email Updates", description: "Receive product news and updates", enabled: true },
    { id: "invoice-reminders", title: "Invoice Reminders", description: "Reminders when invoices are due", enabled: true },
    { id: "task-mentions", title: "Task Mentions", description: "Alerts when someone mentions you", enabled: true },
  ];

  return (
    <ClientDashboardLayout>
      <ClientSettingsPageClient initialProfile={initialProfile} initialNotifications={initialNotifications} />
    </ClientDashboardLayout>
  );
}
