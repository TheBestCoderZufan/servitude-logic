// src/lib/invoices/invoiceValidation.js
import { prisma } from "@/lib/prisma";
import { evaluateBillingReadiness } from "@/lib/workflows/billingReadiness";

/**
 * Build a list of recommended remediation steps based on validation results.
 *
 * @param {Object} params - Validation result fragments.
 * @param {Array} params.deliverables - Deliverable gate results.
 * @param {Array} params.pendingChecklists - Outstanding checklist items.
 * @param {Array} params.pendingFiles - Files awaiting approval.
 * @param {Object} params.timeLogs - Time log aggregation.
 * @param {Object} params.onboarding - Onboarding checklist summary.
 * @returns {string[]} Ordered remediation recommendations.
 */
function buildRecommendationList({
  deliverables,
  pendingChecklists,
  pendingFiles,
  timeLogs,
  onboarding,
}) {
  const recommendations = [];

  if (deliverables.some((d) => !d.isApproved && !d.hasDeferment)) {
    recommendations.push("Finalize client approval or defer remaining deliverables.");
  }
  if (pendingFiles.length > 0) {
    recommendations.push("Resolve outstanding file approvals before invoicing.");
  }
  if (pendingChecklists.length > 0) {
    recommendations.push("Complete deliverable review checklists tied to uploaded files.");
  }
  if ((timeLogs?.missingTaskIds || []).length > 0) {
    recommendations.push("Add time logs for deliverables missing effort before billing.");
  }
  if (!onboarding.complete) {
    recommendations.push("Finish onboarding checklist items to close out the project phase.");
  }

  return recommendations;
}

/**
 * Run pre-invoice validation checks against a project.
 *
 * @param {Object} params - Validation parameters.
 * @param {string} params.projectId - Target project identifier.
 * @param {Object} [params.prismaClient] - Optional Prisma client override.
 * @returns {Promise<Object>} Resolves with validation readiness data.
 */
export async function runPreInvoiceValidation({ projectId, prismaClient = prisma }) {
  const readiness = await evaluateBillingReadiness({ projectId, prismaClient });

  const readinessScore =
    readiness.ready &&
    (readiness.timeLogs?.missingTaskIds?.length || 0) === 0 &&
    readiness.onboarding?.complete !== false;

  const recommendations = buildRecommendationList({
    deliverables: readiness.deliverables,
    pendingChecklists: readiness.pendingChecklists,
    pendingFiles: readiness.pendingFiles,
    timeLogs: readiness.timeLogs,
    onboarding: readiness.onboarding,
  });

  const summary = readinessScore
    ? "All billing validation checks passed."
    : recommendations[0] || readiness.summary;

  return {
    ready: readinessScore,
    summary,
    readiness,
    recommendations,
  };
}

/**
 * Compute line items for an invoice draft.
 *
 * @param {Object} params
 * @param {string} params.projectId
 * @param {number} params.hourlyRate - Hourly rate used to value time logs.
 * @param {Date} [params.periodStart] - Optional filter start date.
 * @param {Date} [params.periodEnd] - Optional filter end date.
 * @param {Object} [params.prismaClient] - Optional Prisma client override.
 * @returns {Promise<Object>} Resolves with generated line items, hours, and totals.
 */
export async function buildInvoiceLineItems({
  projectId,
  hourlyRate,
  periodStart,
  periodEnd,
  prismaClient = prisma,
}) {
  const project = await prismaClient.project.findUnique({
    where: { id: projectId },
    select: {
      tasks: {
        where: { isDeliverable: true, status: { in: ["CLIENT_APPROVED", "DONE"] } },
        include: {
          timeLogs: true,
        },
      },
    },
  });

  if (!project) {
    return { lineItems: [], total: 0, hours: 0 };
  }

  const withinRange = (date) => {
    if (!date) return true;
    const ts = new Date(date).getTime();
    if (periodStart && ts < periodStart.getTime()) return false;
    if (periodEnd && ts > periodEnd.getTime()) return false;
    return true;
  };

  const lineItems = [];
  let totalHours = 0;

  project.tasks.forEach((task) => {
    const taskHours = (task.timeLogs || [])
      .filter((log) => withinRange(log.date))
      .reduce((sum, log) => sum + (log.hours || 0), 0);

    if (taskHours === 0) {
      return;
    }

    totalHours += taskHours;

    lineItems.push({
      type: "deliverable",
      taskId: task.id,
      description: task.title,
      quantity: Number(taskHours.toFixed(2)),
      unitAmount: hourlyRate,
      total: Number((taskHours * hourlyRate).toFixed(2)),
    });
  });

  const total = lineItems.reduce((sum, item) => sum + item.total, 0);

  return {
    lineItems,
    total: Number(total.toFixed(2)),
    hours: Number(totalHours.toFixed(2)),
  };
}
