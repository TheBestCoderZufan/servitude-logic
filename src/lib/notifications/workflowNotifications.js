// src/lib/notifications/workflowNotifications.js

import { prisma } from "@/lib/prisma";

/**
 * @typedef {Object} WorkflowEventPayload
 * @property {string} entity - Entity type (intake, proposal, project, invoice).
 * @property {string} entityId - Unique identifier for the entity.
 * @property {string} projectId - Project identifier associated with the event.
 * @property {string} actorId - Clerk identifier for the acting user.
 * @property {string} status - Status applied to the entity.
 * @property {string} message - Optional human-readable message.
 * @property {Object} metadata - Additional structured context for dashboards.
 * @property {Object} activityLog - Persisted activity log entry backing the notification.
 */

/**
 * @callback WorkflowEventSubscriber
 * @param {WorkflowEventPayload} payload - Event payload delivered to the subscriber.
 * @returns {void|Promise<void>}
 */

/** @type {Set<WorkflowEventSubscriber>} */
const workflowEventSubscribers = new Set();

/**
 * Compose a deterministic activity log type string.
 *
 * @param {string} entity - Entity type.
 * @param {string} status - Status code for the entity.
 * @returns {string} Type string stored on the activity log.
 */
export function buildWorkflowEventType(entity, status) {
  const safeEntity = entity ? String(entity).toLowerCase() : "unknown";
  const safeStatus = status ? String(status).toLowerCase() : "unspecified";
  return `workflow:${safeEntity}:${safeStatus}`;
}

/**
 * Register a subscriber that receives workflow event payloads.
 *
 * @param {WorkflowEventSubscriber} subscriber - Listener invoked on each workflow event.
 * @returns {Function} Unsubscribe function.
*/
export function subscribeToWorkflowEvents(subscriber) {
  workflowEventSubscribers.add(subscriber);
  return () => workflowEventSubscribers.delete(subscriber);
}

/**
 * Notify all registered subscribers about a workflow event.
 *
 * @param {WorkflowEventPayload} payload - Event payload to broadcast.
 * @returns {Promise<void>} Resolves once all subscribers have been invoked.
 */
export async function broadcastWorkflowNotification(payload) {
  const deliveries = Array.from(workflowEventSubscribers).map(async (subscriber) => {
    try {
      await subscriber(payload);
    } catch (error) {
      console.error("Workflow notification subscriber failed", error);
    }
  });

  await Promise.all(deliveries);
}

/**
 * Record a workflow event, persist metadata in the activity log, and broadcast notifications.
 *
 * @param {Object} params - Event parameters.
 * @param {Object} [params.prismaClient] - Optional Prisma client instance.
 * @param {"intake"|"proposal"|"project"|"invoice"} params.entity - Entity type.
 * @param {string} params.entityId - Identifier of the entity.
 * @param {string} [params.projectId] - Optional project identifier.
 * @param {string} params.actorId - Acting user identifier.
 * @param {string} params.status - Workflow status applied to the entity.
 * @param {string} [params.message] - Optional descriptive message.
 * @param {Object} [params.metadata] - Additional metadata persisted with the event.
 * @param {boolean} [params.broadcast=true] - Whether to broadcast the event to subscribers.
 * @returns {Promise<WorkflowEventPayload>} Persisted activity log backed payload.
*/
export async function recordWorkflowEvent({
  prismaClient = prisma,
  entity,
  entityId,
  projectId,
  actorId,
  status,
  message = "",
  metadata = {},
  broadcast = true,
}) {
  const type = buildWorkflowEventType(entity, status);
  const payloadMetadata = {
    ...metadata,
    status,
  };

  const activityData = {
    userId: actorId,
    type,
    text: message,
    entityType: entity,
    entityId,
    metadata: payloadMetadata,
    intakeId: entity === "intake" ? entityId : undefined,
    proposalId: entity === "proposal" ? entityId : undefined,
    invoiceId: entity === "invoice" ? entityId : undefined,
  };

  if (projectId) {
    activityData.projectId = projectId;
  }

  const activityLog = await prismaClient.activityLog.create({
    data: activityData,
  });

  const payload = {
    entity,
    entityId,
    projectId,
    actorId,
    status,
    message,
    metadata: payloadMetadata,
    activityLog,
  };

  if (broadcast) {
    await broadcastWorkflowNotification(payload);
  }

  return payload;
}
