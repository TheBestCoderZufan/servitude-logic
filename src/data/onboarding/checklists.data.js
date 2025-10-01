// src/data/onboarding/checklists.data.js

/**
 * Represents a checklist item assigned during project kickoff.
 *
 * @typedef {Object} OnboardingItem
 * @property {string} id - Unique identifier for the checklist entry.
 * @property {string} label - Human-readable instruction.
 * @property {string} owner - Owner segment (`admin` or `client`).
 */

/**
 * Default onboarding checklist items generated when a proposal is approved.
 *
 * @type {OnboardingItem[]}
 */
export const onboardingChecklist = [
  {
    id: "admin:create-project-plan",
    label: "Publish detailed project plan and milestone schedule",
    owner: "admin",
  },
  {
    id: "admin:assign-team",
    label: "Confirm delivery team assignments and availability",
    owner: "admin",
  },
  {
    id: "admin:setup-repo",
    label: "Provision repositories, environments, and CI/CD pipelines",
    owner: "admin",
  },
  {
    id: "client:share-assets",
    label: "Provide brand assets, existing documentation, and credentials",
    owner: "client",
  },
  {
    id: "client:stakeholder-calendar",
    label: "Confirm stakeholder availability for weekly checkpoints",
    owner: "client",
  },
  {
    id: "client:integration-access",
    label: "Grant sandbox or API keys for required integrations",
    owner: "client",
  },
];

/**
 * Represents a task template created during project spin-up.
 *
 * @typedef {Object} TaskTemplate
 * @property {string} title - Task title.
 * @property {string} description - Task description / acceptance criteria.
 * @property {"BACKLOG"|"IN_PROGRESS"} status - Initial task status.
 * @property {"LOW"|"MEDIUM"|"HIGH"} priority - Initial priority.
 */

/**
 * Starter tasks that bootstrap the delivery board once a project is spun up.
 *
 * @type {TaskTemplate[]}
 */
export const onboardingTaskTemplates = [
  {
    title: "Kickoff call",
    description: "Schedule project kickoff with stakeholders and circulate agenda.",
    status: "IN_PROGRESS",
    priority: "HIGH",
  },
  {
    title: "Technical architecture outline",
    description: "Draft high-level architecture and review with engineering leads.",
    status: "BACKLOG",
    priority: "MEDIUM",
  },
  {
    title: "Design system audit",
    description: "Evaluate existing brand guidelines and define UI kit deliverables.",
    status: "BACKLOG",
    priority: "MEDIUM",
  },
  {
    title: "Implementation plan",
    description: "Break down feature scope into delivery phases with estimates.",
    status: "BACKLOG",
    priority: "HIGH",
  },
];
