// src/data/forms/clientIntakeForm.data.js

/**
 * Field definition consumed by the client intake wizard.
 * @typedef {Object} IntakeFormField
 * @property {string} id - Unique field identifier.
 * @property {string} label - Display label shown to the user.
 * @property {"text"|"textarea"|"select"|"checkbox"} type - Control type rendered in the UI.
 * @property {boolean} [required=false] - Marks the field as required before advancing.
 * @property {string} [placeholder] - Placeholder text for inputs.
 * @property {string} [helper] - Helper copy that clarifies the prompt.
 * @property {string[]} [options] - Options for select inputs.
 */

/**
 * Step definition for the intake wizard.
 * @typedef {Object} IntakeFormStep
 * @property {string} id - Unique identifier for the step.
 * @property {string} title - Title displayed in the wizard.
 * @property {string} description - Short summary shown under the title.
 * @property {IntakeFormField[]} fields - Fields rendered for the given step.
 */

/**
 * Multi-step intake wizard definitions.
 *
 * @type {IntakeFormStep[]}
 */
export const intakeFormSteps = [
  {
    id: "project-foundations",
    title: "Project Foundations",
    description: "Capture the high-level goals, budget, and timeline so the team can triage quickly.",
    fields: [
      {
        id: "projectName",
        label: "Project name",
        type: "text",
        required: true,
        placeholder: "Servitude Logic marketing website",
        helper: "Use a short descriptive name so the team can reference the request easily.",
      },
      {
        id: "goalStatement",
        label: "Goals & outcomes",
        type: "textarea",
        required: true,
        placeholder: "Describe what success looks like for this project.",
        helper: "Share the business goals, KPIs, or customer problems you need to solve.",
      },
      {
        id: "projectType",
        label: "Project type",
        type: "select",
        required: true,
        options: [
          "Web application",
          "Mobile application",
          "Marketing website",
          "Internal tooling",
          "API / integration",
          "Other",
        ],
        helper: "Selecting the closest match helps route the request to the right squad.",
      },
      {
        id: "budgetRange",
        label: "Estimated budget",
        type: "select",
        required: true,
        options: ["Under $10k", "$10k-$25k", "$25k-$50k", "$50k-$100k", "$100k+"],
        helper: "A range is fine—we use it to align scope and staffing expectations.",
      },
      {
        id: "targetLaunch",
        label: "Target launch or milestone date",
        type: "text",
        required: true,
        placeholder: "e.g., Q1 2025 or April 30, 2025",
        helper: "Share the deadline or window you&apos;re working toward.",
      },
      {
        id: "successMetrics",
        label: "How will we measure success?",
        type: "textarea",
        placeholder: "Key metrics or qualitative signals that indicate success.",
        helper: "List any KPIs, adoption targets, or qualitative outcomes that matter most.",
      },
    ],
  },
  {
    id: "scope-integrations",
    title: "Scope & Integrations",
    description: "Outline technical requirements, systems we must connect to, and existing assets.",
    fields: [
      {
        id: "coreFeatures",
        label: "Core features or deliverables",
        type: "textarea",
        required: true,
        placeholder: "Authentication, billing integration, admin dashboard...",
        helper: "List the major capabilities or deliverables that must be included.",
      },
      {
        id: "integrations",
        label: "Critical integrations or data sources",
        type: "textarea",
        placeholder: "Stripe, HubSpot, internal ERP, etc.",
        helper: "Mention any services, APIs, or datasets we must integrate with.",
      },
      {
        id: "existingAssets",
        label: "Existing assets we should use",
        type: "textarea",
        placeholder: "Design systems, brand guidelines, staging environments...",
        helper: "Link or describe assets we can leverage to accelerate delivery.",
      },
      {
        id: "complianceNeeds",
        label: "Compliance or regulatory considerations",
        type: "textarea",
        placeholder: "HIPAA, SOC 2, GDPR, accessibility requirements...",
        helper: "List any compliance, security, or accessibility requirements.",
      },
      {
        id: "stakeholders",
        label: "Primary stakeholders & decision-makers",
        type: "textarea",
        placeholder: "Name, role, and availability for key stakeholders.",
        helper: "Identify who will review milestones and provide final approvals.",
      },
      {
        id: "risks",
        label: "Known risks or constraints",
        type: "textarea",
        placeholder: "Unknown requirements, third-party dependencies, internal blockers...",
        helper: "Call out any risks we should monitor during planning.",
      },
    ],
  },
  {
    id: "logistics",
    title: "Logistics & Handoffs",
    description: "Share project logistics so we can plan onboarding and communication.",
    fields: [
      {
        id: "preferredCommunication",
        label: "Preferred communication cadence",
        type: "select",
        required: true,
        options: [
          "Weekly standups",
          "Bi-weekly checkpoints",
          "Monthly reviews",
          "As-needed updates",
        ],
        helper: "Let us know how often you want structured updates.",
      },
      {
        id: "decisionDeadline",
        label: "Decision deadline for scope approval",
        type: "text",
        placeholder: "e.g., Need proposal by March 15",
        helper: "Tell us when you need a proposal or kickoff decision.",
      },
      {
        id: "attachments",
        label: "Link to reference docs or files",
        type: "textarea",
        placeholder: "Share URLs to briefs, mockups, or existing documentation.",
        helper: "Separate multiple links with commas or new lines.",
      },
      {
        id: "additionalNotes",
        label: "Anything else we should know?",
        type: "textarea",
        placeholder: "Share context, expectations, or questions for our team.",
        helper: "Use this space for logistical notes or outstanding questions.",
      },
      {
        id: "assetChecklist",
        label: "Do you need help gathering brand or access assets?",
        type: "select",
        options: ["Yes", "No", "Unsure"],
        helper: "If you need support collecting credentials or assets we can prep a checklist.",
      },
    ],
  },
];

/**
 * Flat list of required fields for validation and triage checks.
 * @type {string[]}
 */
export const requiredIntakeFieldIds = intakeFormSteps
  .flatMap((step) => step.fields)
  .filter((field) => field.required)
  .map((field) => field.id);
