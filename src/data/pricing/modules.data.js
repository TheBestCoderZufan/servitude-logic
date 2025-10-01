// src/data/pricing/modules.data.js

/**
 * Describes a reusable pricing module that can be added to a project proposal.
 *
 * @typedef {Object} PricingModule
 * @property {string} id - Stable identifier used when persisting selections.
 * @property {string} category - Group or discipline the module belongs to.
 * @property {string} title - Short, human-readable module title.
 * @property {string} description - Supporting copy that explains the module scope.
 * @property {number} defaultHours - Recommended engineering/design hours for the module.
 * @property {number} blendedRate - Default hourly rate applied when calculating the line total.
 */

/**
 * Library of reusable pricing modules that fuel proposal assembly.
 *
 * Stored in data to keep configuration versioned and readable by both admin
 * tooling and automated project creation steps.
 *
 * @type {PricingModule[]}
 */
export const pricingModules = [
  {
    id: "discovery_workshop",
    category: "Strategy",
    title: "Discovery workshop",
    description: "Stakeholder interviews, requirements mapping, and product vision alignment sessions.",
    defaultHours: 16,
    blendedRate: 165,
  },
  {
    id: "ux_wireframes",
    category: "Design",
    title: "UX wireframes",
    description: "Clickable wireframes covering primary flows and responsive breakpoints.",
    defaultHours: 40,
    blendedRate: 150,
  },
  {
    id: "ui_design_system",
    category: "Design",
    title: "UI design system",
    description: "Component library, typography, color tokens, and interaction states.",
    defaultHours: 32,
    blendedRate: 155,
  },
  {
    id: "frontend_app",
    category: "Engineering",
    title: "Frontend application",
    description: "Implementation of authenticated user flows, dashboards, and responsive layout.",
    defaultHours: 120,
    blendedRate: 170,
  },
  {
    id: "api_development",
    category: "Engineering",
    title: "API & database",
    description: "Secure REST API, data modeling, and deployment automation for the backend.",
    defaultHours: 96,
    blendedRate: 180,
  },
  {
    id: "qa_automation",
    category: "Quality",
    title: "QA automation",
    description: "End-to-end test coverage, regression suite, and performance smoke checks.",
    defaultHours: 48,
    blendedRate: 140,
  },
  {
    id: "cloud_infrastructure",
    category: "Operations",
    title: "Cloud infrastructure setup",
    description: "Infrastructure as code, CI/CD pipelines, monitoring, and observability stack.",
    defaultHours: 36,
    blendedRate: 175,
  },
  {
    id: "launch_support",
    category: "Operations",
    title: "Launch support",
    description: "Cutover planning, smoke testing, incident response playbooks, and hypercare.",
    defaultHours: 24,
    blendedRate: 160,
  },
];
