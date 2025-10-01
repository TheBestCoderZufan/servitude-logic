// src/app/dashboard/page.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRole, isClientRole } from "@/lib/api-helpers";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import DashboardPageClient from "./DashboardPageClient";
import { evaluateBillingReadiness } from "@/lib/workflows/billingReadiness";

export const revalidate = 0;

/**
 * Client Dashboard (Server Component)
 *
 * SSRs a summarized view of projects, invoices, tasks, and files for the
 * current user (client-scoped by default). Honors the optional `projectId`
 * search param for scoping stats to a single project.
 *
 * @param {Object} ctx - Next.js page context with searchParams.
 * @returns {Promise<JSX.Element>} The dashboard page.
 */
export default async function ClientDashboardPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) return null;
  const role = await getUserRole(userId);
  const clientScope = isClientRole(role);

  const sp = await searchParams;
  const projectId = sp?.projectId && sp.projectId !== "all"
    ? String(searchParams.projectId)
    : undefined;

  // Base project filter by role
  const projectWhere = clientScope
    ? { client: { userId } }
    : projectId
    ? { id: projectId }
    : {};

  // Load essentials in parallel
  const [projects, invoices, tasks, files, deliverables] = await Promise.all([
    prisma.project.findMany({
      where: projectId ? { ...projectWhere, id: projectId } : projectWhere,
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.invoice.findMany({
      where: {
        project: projectId ? { id: projectId } : projectWhere,
      },
      orderBy: { issueDate: "desc" },
      take: 100,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        project: projectId ? { id: projectId } : projectWhere,
      },
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { priority: "desc" },
      ],
      take: 50,
    }),
    prisma.file.findMany({
      where: {
        project: projectId ? { id: projectId } : projectWhere,
      },
      orderBy: { uploadedAt: "desc" },
      take: 5,
      select: {
        id: true,
        fileName: true,
        fileType: true,
        url: true,
        uploadedAt: true,
      },
    }),
    prisma.task.findMany({
      where: {
        project: projectId ? { id: projectId } : projectWhere,
        isDeliverable: true,
      },
      include: {
        project: { select: { id: true, name: true } },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 2,
        },
      },
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { updatedAt: "desc" },
      ],
    }),
  ]);

  /**
   * Lightweight client profile and intake submissions awaiting triage.
   * Used to personalize the dashboard and surface pending requests.
   * @type {{profile: {contactName: string|null, companyName: string|null}|null, intakes: Array<{id: string, status: string, submittedAt: string, projectName: string, summary: string, budgetRange: string|null, targetLaunch: string|null}>}}
   */
  let pendingIntakeContext = { profile: null, intakes: [] };

  if (clientScope) {
    const clientRecord = await prisma.client.findUnique({
      where: { userId },
      select: {
        id: true,
        contactName: true,
        companyName: true,
      },
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

      const pendingIntakes = rawPendingIntakes.map((intake) => {
        const formData =
          intake.formData && typeof intake.formData === "object" && !Array.isArray(intake.formData)
            ? /** @type {Record<string, unknown>} */ (intake.formData)
            : {};

        const projectNameRaw = formData.projectName;
        const projectName =
          typeof projectNameRaw === "string" && projectNameRaw.trim().length > 0
            ? projectNameRaw.trim()
            : "Pending intake request";

        const summaryText =
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
          summary: summaryText,
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

      pendingIntakeContext = {
        profile: {
          contactName: clientRecord.contactName,
          companyName: clientRecord.companyName,
        },
        intakes: pendingIntakes,
      };
    }
  }

  const deliverableProgress = {
    total: deliverables.length,
    approved: 0,
    readyForReview: 0,
    blocked: 0,
    inProgress: 0,
    backlog: 0,
    deferred: 0,
  };

  const STATUS_TO_PROGRESS = {
    CLIENT_APPROVED: "approved",
    READY_FOR_REVIEW: "readyForReview",
    BLOCKED: "blocked",
    IN_PROGRESS: "inProgress",
    BACKLOG: "backlog",
    DONE: "inProgress",
  };

  deliverables.forEach((task) => {
    const key = STATUS_TO_PROGRESS[task.status] || "inProgress";
    deliverableProgress[key] = (deliverableProgress[key] || 0) + 1;
    const hasDeferment = task.statusHistory?.some(
      (entry) => entry.context === "BILLING_DEFERMENT",
    );
    if (hasDeferment) {
      deliverableProgress.deferred += 1;
    }
  });

  const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const upcomingDeliverables = deliverables
    .filter((task) => {
      if (!task.dueDate) {
        return task.status === "READY_FOR_REVIEW";
      }
      return new Date(task.dueDate) <= twoWeeksFromNow;
    })
    .map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      project: task.project,
      latestStatusNote: task.statusHistory?.[0]?.note || null,
    }))
    .slice(0, 5);

  let billingSummary = null;
  if (projectId) {
    billingSummary = await evaluateBillingReadiness({ projectId });
  }

  return (
    <ClientDashboardLayout>
      <DashboardPageClient
        initialProjects={projects}
        initialInvoices={invoices}
        initialTasks={tasks}
        initialFiles={files}
        initialDeliverables={upcomingDeliverables}
        initialDeliverableProgress={deliverableProgress}
        initialBillingSummary={billingSummary}
        initialPendingIntakes={pendingIntakeContext.intakes}
        clientProfile={pendingIntakeContext.profile}
      />
    </ClientDashboardLayout>
  );
}
/** @module dashboard/page */
