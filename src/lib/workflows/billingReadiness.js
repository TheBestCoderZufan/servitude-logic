// src/lib/workflows/billingReadiness.js
import { prisma } from "@/lib/prisma";

/**
 * Represents a deliverable task's billing gate evaluation.
 * @typedef {Object} DeliverableGateResult
 * @property {string} id - Task identifier.
 * @property {string} title - Task title used in summaries.
 * @property {string} status - Current task status.
 * @property {boolean} isApproved - True when the task is client approved.
 * @property {boolean} hasDeferment - True when a billing deferment note exists.
 * @property {string|null} latestNote - Most recent note tied to approval or deferment.
 */

/**
 * Represents a pending checklist item linked to a file.
 * @typedef {Object} ChecklistGateItem
 * @property {string} fileId - Related file identifier.
 * @property {string} fileName - Friendly file name.
 * @property {string} checklistId - Checklist item identifier.
 * @property {string} label - Checklist label describing the requirement.
 * @property {string} status - Current checklist status.
 */

/**
 * Represents a file awaiting approval.
 * @typedef {Object} PendingFileGateItem
 * @property {string} id - File identifier.
 * @property {string} name - File display name.
 * @property {string} status - Approval status.
 */

/**
 * Evaluates whether a project is ready for billing based on deliverable approvals.
 *
 * Checks deliverable tasks, file approvals, and review checklists to ensure
 * every in-scope item is either client approved or formally deferred.
 *
 * @param {Object} params - Evaluation parameters.
 * @param {string} params.projectId - Target project identifier.
 * @param {object} [params.prismaClient=prisma] - Optional Prisma client override.
 * @returns {Promise<{ready: boolean, deliverables: DeliverableGateResult[], pendingChecklists: ChecklistGateItem[], pendingFiles: PendingFileGateItem[], summary: string}>}
 */
export async function evaluateBillingReadiness({ projectId, prismaClient = prisma }) {
  const project = await prismaClient.project.findUnique({
    where: { id: projectId },
    select: {
      workflowMetadata: true,
      tasks: {
        where: { isDeliverable: true },
        include: {
          timeLogs: true,
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
      files: {
        include: {
          reviewChecklist: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!project) {
    return {
      ready: false,
      deliverables: [],
      pendingChecklists: [],
      pendingFiles: [],
      timeLogs: { totalHours: 0, missingTaskIds: [] },
      onboarding: { complete: true, pending: [] },
      summary: "Project not found",
    };
  }

  const deliverableTasks = project.tasks || [];

  const deliverables = deliverableTasks.map((task) => {
    const recentHistory = task.statusHistory ?? [];
    const lastDeferment = recentHistory.find((entry) => entry.context === "BILLING_DEFERMENT");
    const lastStatusEntry = recentHistory.find((entry) => entry.context === "STATUS_CHANGE");
    const totalHours = (task.timeLogs || []).reduce((sum, log) => sum + (log.hours || 0), 0);
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      isApproved: task.status === "CLIENT_APPROVED",
      hasDeferment: Boolean(lastDeferment),
      latestNote: (lastDeferment || lastStatusEntry)?.note || null,
      totalHours,
    };
  });

  const pendingDeliverables = deliverables.filter(
    (item) => !item.isApproved && !item.hasDeferment,
  );

  const pendingChecklists = (project.files || [])
    .flatMap((file) => (file.reviewChecklist || []).map((item) => ({ file, item })))
    .filter(({ item }) => item.status === "PENDING" || item.status === "IN_REVIEW")
    .map(({ file, item }) => ({
      fileId: file.id,
      fileName: file.fileName,
      checklistId: item.id,
      label: item.label,
      status: item.status,
    }));

  const pendingFiles = (project.files || [])
    .filter((file) => file.approvalStatus !== "APPROVED")
    .map((file) => ({
      id: file.id,
      name: file.fileName,
      status: file.approvalStatus,
    }));

  const totalHours = deliverables.reduce((sum, item) => sum + (item.totalHours || 0), 0);
  const missingTaskIds = deliverables
    .filter((item) => (item.totalHours || 0) === 0)
    .map((item) => item.id);

  const onboardingChecklist = Array.isArray(project.workflowMetadata?.onboardingChecklist)
    ? project.workflowMetadata.onboardingChecklist
    : [];
  const pendingOnboarding = onboardingChecklist.filter((item) => {
    if (item === null || typeof item !== "object") return false;
    if (typeof item.completed === "boolean") return !item.completed;
    if (typeof item.complete === "boolean") return !item.complete;
    if (typeof item.done === "boolean") return !item.done;
    return false;
  });

  const blockingItemCount = pendingDeliverables.length + pendingChecklists.length + pendingFiles.length;
  const ready =
    blockingItemCount === 0 && missingTaskIds.length === 0 && pendingOnboarding.length === 0;

  const summary = ready
    ? "All deliverables approved or deferred."
    : `${blockingItemCount + missingTaskIds.length + pendingOnboarding.length} gating item${
        blockingItemCount + missingTaskIds.length + pendingOnboarding.length === 1 ? "" : "s"
      } require attention before billing.`;

  return {
    ready,
    deliverables,
    pendingChecklists,
    pendingFiles,
    timeLogs: {
      totalHours,
      missingTaskIds,
    },
    onboarding: {
      complete: pendingOnboarding.length === 0,
      pending: pendingOnboarding,
    },
    summary,
  };
}
