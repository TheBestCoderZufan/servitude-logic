// src/lib/tasks/taskWorkflow.js

/**
 * Status buckets that demand documentation when a task enters them.
 * @type {Set<string>}
 */
export const NOTE_REQUIRED_STATUSES = new Set([
  "BLOCKED",
  "READY_FOR_REVIEW",
  "CLIENT_APPROVED",
]);

/**
 * Normalizes a transition note, returning a guaranteed non-empty string.
 *
 * @param {unknown} note - Raw note input (might be undefined, null, or string).
 * @param {string} fallback - Default text when the provided note is blank.
 * @returns {string} Sanitized note string.
 */
export function normalizeTransitionNote(note, fallback) {
  const trimmed = typeof note === "string" ? note.trim() : "";
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Indicates whether the target status mandates a transition note.
 *
 * @param {string} status - Destination task status.
 * @returns {boolean} True when the status requires documentation.
 */
export function statusRequiresNote(status) {
  return NOTE_REQUIRED_STATUSES.has(status);
}
