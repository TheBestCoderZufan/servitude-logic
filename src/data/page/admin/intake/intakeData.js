// src/data/page/admin/intake/intakeData.js

import { intakeWorkflowStates } from "@/data/workflows/clientSubmissionToBilling";

/**
 * @typedef {Object} IntakeStatusOption
 * @property {string} value - Status value persisted in the database.
 * @property {string} label - Human readable label.
 * @property {string} description - Helper copy explaining the state.
 */

/**
 * Intake status filter options for the admin intake dashboard.
 *
 * @type {IntakeStatusOption[]}
 */
export const intakeStatusOptions = intakeWorkflowStates.map((state) => ({
  value: state.id,
  label: state.label,
  description: state.description,
}));

/** @type {Record<string, IntakeStatusOption>} */
const intakeStatusLookup = intakeStatusOptions.reduce(
  (accumulator, option) => ({
    ...accumulator,
    [option.value]: option,
  }),
  {},
);

/**
 * Formats a status string into a friendly label.
 *
 * @param {string} status - Raw status value.
 * @returns {string} Friendly label.
 */
export function intakeStatusLabel(status) {
  const match = intakeStatusLookup[status];
  return match ? match.label : status.replace(/_/g, " ");
}
