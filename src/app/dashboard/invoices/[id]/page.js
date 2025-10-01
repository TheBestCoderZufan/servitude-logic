// src/app/dashboard/invoices/[id]/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import InvoiceDetailPageClient from "./InvoiceDetailPageClient";

export const revalidate = 0;

export default async function ClientInvoiceDetailPage({ params }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  const id = params?.id;
  if (!id) return null;

  const where = isClientRole(role) ? { id, project: { client: { userId } } } : { id };

  const invoice = await prisma.invoice.findFirst({
    where,
    include: {
      project: {
        include: {
          client: true,
          tasks: {
            include: {
              timeLogs: { include: { user: { select: { clerkId: true, name: true, email: true } } } },
            },
          },
        },
      },
    },
  });
  if (!invoice) return null;

  const timeLogsByUser = invoice.project.tasks.reduce((acc, task) => {
    task.timeLogs.forEach((log) => {
      const key = log.user.clerkId;
      if (!acc[key]) acc[key] = { user: log.user, totalHours: 0, logs: [] };
      acc[key].totalHours += log.hours;
      acc[key].logs.push({ ...log, taskTitle: task.title });
    });
    return acc;
  }, {});

  const invoiceWithStats = {
    ...invoice,
    timeLogsByUser: Object.values(timeLogsByUser),
  };

  return (
    <ClientDashboardLayout>
      <InvoiceDetailPageClient invoice={invoiceWithStats} />
    </ClientDashboardLayout>
  );
}
