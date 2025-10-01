// src/data/workflows/clientSubmissionToBilling.js

/**
 * @typedef {Object} WorkflowChecklistItem
 * @property {string} id - Unique identifier for the checklist item.
 * @property {string} label - Short label describing the item.
 * @property {string} description - Detailed explanation that can surface in tooltips.
 */

/**
 * @typedef {Object} WorkflowTransition
 * @property {string} to - Target status identifier for a valid transition.
 * @property {string} label - Human friendly description of the transition.
 * @property {string[]} [guards] - Optional guard identifiers that must pass before transition executes.
 */

/**
 * @typedef {Object} WorkflowState
 * @property {string} id - Stable identifier aligned with database enums.
 * @property {string} label - Display label for UI surfaces.
 * @property {string} description - Summary of the state intent.
 * @property {WorkflowChecklistItem[]} checklist - Checklist items required before moving forward.
 * @property {WorkflowTransition[]} transitions - Allowed transitions to other states.
 */

/**
 * Guided workflow states for intake submissions.
 *
 * @type {WorkflowState[]}
 */
export const intakeWorkflowStates = [
  {
    id: "REVIEW_PENDING",
    label: "Review Pending",
    description: "Awaiting admin triage after the client&apos;s submission.",
    checklist: [
      {
        id: "confirm-brief",
        label: "Confirm project brief",
        description: "Ensure the client&apos;s goals, timeline, and budget fields are complete.",
      },
      {
        id: "assign-owner",
        label: "Assign intake owner",
        description: "Identify who is responsible for shepherding the request.",
      },
    ],
    transitions: [
      { to: "RETURNED_FOR_INFO", label: "Request more information" },
      { to: "APPROVED_FOR_ESTIMATE", label: "Ready for estimation" },
    ],
  },
  {
    id: "RETURNED_FOR_INFO",
    label: "Returned for Info",
    description: "Client must clarify requirements before work continues.",
    checklist: [
      {
        id: "info-requested",
        label: "Detail missing context",
        description: "Log the gaps so the client can respond quickly.",
      },
    ],
    transitions: [{ to: "REVIEW_PENDING", label: "Client responded" }],
  },
  {
    id: "APPROVED_FOR_ESTIMATE",
    label: "Approved for Estimate",
    description: "Scope is defined enough for estimation work to start.",
    checklist: [
      {
        id: "scope-check",
        label: "Finalize scope outline",
        description: "Document must-haves, integrations, and success metrics.",
      },
    ],
    transitions: [{ to: "ESTIMATE_IN_PROGRESS", label: "Open estimation workspace" }],
  },
  {
    id: "ESTIMATE_IN_PROGRESS",
    label: "Estimate in Progress",
    description: "Admin team is preparing timelines and pricing.",
    checklist: [
      {
        id: "pricing-modules",
        label: "Select pricing modules",
        description: "Choose reusable components from the pricing catalog.",
      },
      {
        id: "risk-review",
        label: "Capture delivery risks",
        description: "Flag assumptions and dependencies prior to sharing with the client.",
      },
    ],
    transitions: [{ to: "ESTIMATE_SENT", label: "Send estimate to client" }],
  },
  {
    id: "ESTIMATE_SENT",
    label: "Estimate Sent",
    description: "Client is reviewing the proposed plan and pricing.",
    checklist: [
      {
        id: "follow-up-schedule",
        label: "Schedule follow-up",
        description: "Set expectation for feedback to avoid stalls.",
      },
    ],
    transitions: [
      { to: "CLIENT_SCOPE_APPROVED", label: "Client approved" },
      { to: "CLIENT_SCOPE_DECLINED", label: "Client declined" },
    ],
  },
  {
    id: "CLIENT_SCOPE_APPROVED",
    label: "Client Approved Scope",
    description: "Scope, pricing, and terms accepted by the client.",
    checklist: [
      {
        id: "activity-log",
        label: "Log approval",
        description: "Capture approval source, timestamp, and any conditions.",
      },
    ],
    transitions: [{ to: "ARCHIVED", label: "Archive intake" }],
  },
  {
    id: "CLIENT_SCOPE_DECLINED",
    label: "Client Declined Scope",
    description: "Client declined or postponed the proposed work.",
    checklist: [
      {
        id: "decline-reason",
        label: "Document decline reason",
        description: "Record feedback for future process improvements.",
      },
    ],
    transitions: [
      { to: "ESTIMATE_IN_PROGRESS", label: "Revise estimate" },
      { to: "ARCHIVED", label: "Archive intake" },
    ],
  },
  {
    id: "ARCHIVED",
    label: "Archived",
    description: "Intake is closed and stored for historical reference.",
    checklist: [],
    transitions: [],
  },
];

/**
 * Proposal workflow states align with the Prisma `ProjectProposal` model.
 *
 * @type {WorkflowState[]}
 */
export const proposalWorkflowStates = [
  {
    id: "DRAFT",
    label: "Draft",
    description: "Estimate is being assembled internally.",
    checklist: [
      {
        id: "pricing-review",
        label: "Review pricing components",
        description: "Confirm cost inputs and margin targets.",
      },
    ],
    transitions: [
      { to: "IN_REVIEW", label: "Send to peer review" },
      { to: "CLIENT_APPROVAL_PENDING", label: "Share with client" },
    ],
  },
  {
    id: "IN_REVIEW",
    label: "Peer Review",
    description: "A second admin is validating scope and assumptions.",
    checklist: [
      {
        id: "risk-signoff",
        label: "Sign off on risks",
        description: "Ensure mitigation strategies are documented before client review.",
      },
    ],
    transitions: [{ to: "CLIENT_APPROVAL_PENDING", label: "Move to client review" }],
  },
  {
    id: "CLIENT_APPROVAL_PENDING",
    label: "Client Review",
    description: "Proposal is with the client for approval.",
    checklist: [
      {
        id: "notification",
        label: "Notify stakeholders",
        description: "Alert project manager and finance that the proposal is client-facing.",
      },
    ],
    transitions: [
      { to: "APPROVED", label: "Client approved" },
      { to: "DECLINED", label: "Client declined" },
      { to: "IN_REVIEW", label: "Re-open internal review" },
    ],
  },
  {
    id: "APPROVED",
    label: "Approved",
    description: "Client formally approved the scope.",
    checklist: [
      {
        id: "archive-draft",
        label: "Archive proposal draft",
        description: "Save a PDF copy with client acceptance details.",
      },
    ],
    transitions: [],
  },
  {
    id: "DECLINED",
    label: "Declined",
    description: "Client rejected the proposal or requested cancellation.",
    checklist: [
      {
        id: "feedback-loop",
        label: "Gather feedback",
        description: "Capture client reasoning for continuous improvement.",
      },
    ],
    transitions: [{ to: "DRAFT", label: "Revise and resend" }],
  },
];

/**
 * Macro workflow phases for projects (separate from delivery status).
 *
 * @type {WorkflowState[]}
 */
export const projectWorkflowPhases = [
  {
    id: "INTAKE",
    label: "Intake",
    description: "Request captured and awaiting qualification.",
    checklist: [],
    transitions: [{ to: "ESTIMATION", label: "Begin estimation" }],
  },
  {
    id: "ESTIMATION",
    label: "Estimation",
    description: "Scope and proposal are being finalized.",
    checklist: [],
    transitions: [{ to: "KICKOFF", label: "Kickoff confirmed" }],
  },
  {
    id: "KICKOFF",
    label: "Kickoff",
    description: "Team onboarding and project setup in progress.",
    checklist: [],
    transitions: [{ to: "DELIVERY", label: "Delivery underway" }],
  },
  {
    id: "DELIVERY",
    label: "Delivery",
    description: "Build, QA, and iteration cycles active.",
    checklist: [],
    transitions: [{ to: "REVIEW", label: "Client review" }],
  },
  {
    id: "REVIEW",
    label: "Review",
    description: "Awaiting client acceptance of deliverables.",
    checklist: [],
    transitions: [{ to: "BILLING", label: "Enter billing" }],
  },
  {
    id: "BILLING",
    label: "Billing",
    description: "Invoice preparation and validation underway.",
    checklist: [],
    transitions: [{ to: "COMPLETE", label: "Complete engagement" }],
  },
  {
    id: "COMPLETE",
    label: "Complete",
    description: "Engagement fulfilled and closed out.",
    checklist: [],
    transitions: [{ to: "ARCHIVED", label: "Archive" }],
  },
  {
    id: "ARCHIVED",
    label: "Archived",
    description: "Historical project state with no active work.",
    checklist: [],
    transitions: [],
  },
];

/**
 * Workflow states guiding invoice readiness and follow-up activities.
 *
 * @type {WorkflowState[]}
 */
export const invoiceWorkflowStates = [
  {
    id: "AWAITING_VALIDATION",
    label: "Awaiting Validation",
    description: "Quality gate checks must pass before generating the invoice.",
    checklist: [
      {
        id: "scope-approved",
        label: "Verify scope approvals",
        description: "Confirm deliverables in scope are marked client approved.",
      },
      {
        id: "hours-logged",
        label: "Reconcile logged hours",
        description: "Ensure time entries tie to the correct billing period.",
      },
    ],
    transitions: [{ to: "READY_TO_SEND", label: "Validation complete" }],
  },
  {
    id: "READY_TO_SEND",
    label: "Ready to Send",
    description: "Invoice draft is ready for finance review.",
    checklist: [
      {
        id: "finance-review",
        label: "Finance review",
        description: "Finance approves line items and payment terms.",
      },
    ],
    transitions: [
      { to: "SCHEDULED", label: "Schedule delivery" },
      { to: "SENT_AND_PENDING_PAYMENT", label: "Send immediately" },
    ],
  },
  {
    id: "SCHEDULED",
    label: "Scheduled",
    description: "Invoice has a planned send date.",
    checklist: [],
    transitions: [{ to: "SENT_AND_PENDING_PAYMENT", label: "Send invoice" }],
  },
  {
    id: "SENT_AND_PENDING_PAYMENT",
    label: "Sent",
    description: "Invoice delivered and awaiting payment.",
    checklist: [
      {
        id: "reminder-plan",
        label: "Set reminder plan",
        description: "Define reminder cadence before the due date.",
      },
    ],
    transitions: [
      { to: "IN_REMINDER_SEQUENCE", label: "Start reminders" },
      { to: "PAID_AND_CONFIRMED", label: "Confirm payment" },
    ],
  },
  {
    id: "IN_REMINDER_SEQUENCE",
    label: "Reminder Sequence",
    description: "Automated reminders are active for overdue invoices.",
    checklist: [
      {
        id: "escalation-check",
        label: "Escalation plan",
        description: "Determine escalation path if payment remains outstanding.",
      },
    ],
    transitions: [{ to: "PAID_AND_CONFIRMED", label: "Payment received" }],
  },
  {
    id: "PAID_AND_CONFIRMED",
    label: "Paid",
    description: "Funds received and reconciled.",
    checklist: [
      {
        id: "receipt",
        label: "Send receipt",
        description: "Provide payment confirmation to the client.",
      },
    ],
    transitions: [{ to: "CLOSED", label: "Close invoice" }],
  },
  {
    id: "CLOSED",
    label: "Closed",
    description: "Invoice workflow complete with documentation archived.",
    checklist: [],
    transitions: [],
  },
];

/**
 * Ordered client submission workflow combining each functional area.
 *
 * @type {{intake: WorkflowState[], proposal: WorkflowState[], project: WorkflowState[], invoice: WorkflowState[]}}
 */
export const clientSubmissionToBillingWorkflow = {
  intake: intakeWorkflowStates,
  proposal: proposalWorkflowStates,
  project: projectWorkflowPhases,
  invoice: invoiceWorkflowStates,
};

/**
 * Map of workflow states keyed by stage then state id for O(1) lookups.
 *
 * @type {Record<string, Record<string, WorkflowState>>}
 */
export const workflowStateLookup = Object.entries(clientSubmissionToBillingWorkflow).reduce(
  (accumulator, [stageKey, states]) => ({
    ...accumulator,
    [stageKey]: states.reduce(
      (stageAcc, state) => ({
        ...stageAcc,
        [state.id]: state,
      }),
      {},
    ),
  }),
  {},
);

/**
 * Retrieve a workflow state definition for a given stage and identifier.
 *
 * @param {string} stage - Workflow stage key.
 * @param {string} stateId - Target state identifier.
 * @returns {WorkflowState|undefined} State definition when available.
 */
export function getWorkflowStateDefinition(stage, stateId) {
  const stageLookup = workflowStateLookup[String(stage)];
  return stageLookup ? stageLookup[stateId] : undefined;
}

/**
 * List of workflow stages ordered as the intake progresses.
 *
 * @type {string[]}
 */
export const clientSubmissionWorkflowOrder = ["intake", "proposal", "project", "invoice"];
