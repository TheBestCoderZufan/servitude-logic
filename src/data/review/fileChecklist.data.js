// src/data/review/fileChecklist.data.js

/**
 * Default checklist items applied to deliverable reviews.
 * @type {Array<{id: string, label: string, description: string}>}
 */
export const defaultFileReviewChecklist = [
  {
    id: "scope-match",
    label: "Scope alignment confirmed",
    description: "Deliverable matches the approved scope and feature list.",
  },
  {
    id: "acceptance-criteria",
    label: "Acceptance criteria satisfied",
    description: "All acceptance criteria have been verified and documented.",
  },
  {
    id: "qa-signoff",
    label: "QA sign-off",
    description: "Quality assurance checks are complete with no blocking defects.",
  },
  {
    id: "stakeholder-visibility",
    label: "Stakeholder visibility",
    description: "Stakeholder notifications prepared with rollout notes and risks.",
  },
];
