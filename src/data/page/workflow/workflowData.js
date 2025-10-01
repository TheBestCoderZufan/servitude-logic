// src/data/page/workflow/workflowData.js
import { FiTarget, FiActivity, FiCalendar, FiUsers } from "react-icons/fi";

/**
 * @typedef {Object} WorkflowMetric
 * @property {string} id - Unique identifier for the metric.
 * @property {string} label - Descriptive label for the metric.
 * @property {number} value - Numeric value displayed by the counter.
 * @property {string} suffix - Suffix appended to the counter value.
 * @property {string} description - Supporting explanation for the metric.
 */

/**
 * @typedef {Object} WorkflowPhase
 * @property {string} id - Phase identifier.
 * @property {string} title - Phase title.
 * @property {string} description - Phase description.
 */

/**
 * @typedef {Object} WorkflowRitual
 * @property {string} id - Ritual identifier.
 * @property {Function} icon - Icon component to render.
 * @property {string} title - Ritual title.
 * @property {string} detail - Ritual description.
 */

/**
 * @typedef {Object} WorkflowShowcaseSlide
 * @property {string} id - Unique slide identifier.
 * @property {string} title - Slide eyebrow copy.
 * @property {string} headline - Main slide headline copy.
 * @property {string} copy - Supporting slide description.
 */

/**
 * Hero content for the workflow marketing page.
 * @type {{ eyebrow: string, heroTitle: string, heroSubtitle: string, primaryCta: { label: string, href: string }, secondaryCta: { label: string, href: string } }}
 */
export const workflowHero = {
  eyebrow: "Operating system",
  heroTitle:
    "A choreography that blends <span class=\"text-primary\">research, delivery, and growth</span> into one rhythm",
  heroSubtitle:
    "We embed orchestrated pods that combine discovery, design, engineering, analytics, and enablement. Every ritual is tuned to unblock stakeholders, surface evidence, and keep momentum visible in real time.",
  primaryCta: {
    label: "Schedule an immersion",
    href: "/contact",
  },
  secondaryCta: {
    label: "Explore engagement plans",
    href: "/services",
  },
};

/**
 * Metrics showcased as animated counters.
 * @type {Array<WorkflowMetric>}
 */
export const workflowMetrics = [
  {
    id: "kickoff",
    label: "Kickoff to production handoff",
    value: 21,
    suffix: " days",
    description: "Median time from first immersion to a production feature behind progressive rollout.",
  },
  {
    id: "surveys",
    label: "Stakeholder survey alignment",
    value: 97,
    suffix: "%",
    description: "Stakeholders reporting &quot;clear visibility&quot; into roadmap and release cadence after month one.",
  },
  {
    id: "retro",
    label: "Actionable retro insights per sprint",
    value: 6,
    suffix: "+",
    description: "Average improvements carved directly into backlog rituals every two-week cycle.",
  },
];

/**
 * Delivery phases rendered in a timeline.
 * @type {Array<WorkflowPhase>}
 */
export const workflowPhases = [
  {
    id: "immersion",
    title: "Immersion &amp; ignition",
    description: "Hypothesis mapping, telemetry instrumentation, success metric baselining, and stakeholder interviews within the first 72 hours.",
  },
  {
    id: "integration",
    title: "Integration &amp; orchestration",
    description: "Pods align discovery tracks with delivery waves, automate QA guardrails, and merge experimentation with engineering throughput.",
  },
  {
    id: "amplify",
    title: "Amplify &amp; scale",
    description: "Launch support, revenue experiments, enablement resources, and ongoing observability keep learnings compounding.",
  },
];

/**
 * Ritual highlights animated with springs.
 * @type {Array<WorkflowRitual>}
 */
export const workflowRituals = [
  {
    id: "cadence",
    icon: FiCalendar,
    title: "Cadence clarity",
    detail: "Weekly lighthouse roadmap reviews and daily async pulses ensure every leader sees progress and upcoming risks in a single panel.",
  },
  {
    id: "experiment",
    icon: FiActivity,
    title: "Evidence-first experiments",
    detail: "Each delivery wave pairs with analytics instrumentation, structured bet canvases, and revenue heuristics to validate impact quickly.",
  },
  {
    id: "enablement",
    icon: FiUsers,
    title: "Always-on enablement",
    detail: "Playbooks, documentation, and live looms keep internal teams empowered to extend Servitude Logic practices autonomously.",
  },
  {
    id: "resilience",
    icon: FiTarget,
    title: "Resilience rehearsals",
    detail: "Chaos drills, alert runbooks, and compliance checkpoints turn incident response into rehearsed choreography instead of reaction.",
  },
];

/**
 * Reveal.js slides that showcase workflow artifacts.
 * @type {Array<WorkflowShowcaseSlide>}
 */
export const workflowShowcase = [
  {
    id: "signals",
    title: "Signal atlas",
    headline: "Dynamic dashboards unify product, revenue, and reliability telemetry",
    copy: "A single canvas aggregates North Star metrics, experiment velocity, and system health so executives, PMs, and operators share one vantage point.",
  },
  {
    id: "podplaybook",
    title: "Pod playbooks",
    headline: "Deployment scripts, rituals, and enablement packaged for your org",
    copy: "We deliver customizable runbooks covering discovery cadences, design reviews, release trains, and escalation ladders tailored to your structure.",
  },
  {
    id: "growthloop",
    title: "Growth loop",
    headline: "Feedback loops embed across retention, monetization, and advocacy",
    copy: "Lifecycle experiments ship alongside product features so every interaction feeds back into the roadmap and client success rituals.",
  },
];

/**
 * Accelerator callouts that extend the workflow.
 * @type {Array<{id: string, title: string, description: string}>}
 */
export const workflowAccelerators = [
  {
    id: "ops",
    title: "Fractional product operations",
    description: "Stand up PMO instrumentation, FAC governance, and portfolio rituals that outlive the initial engagement.",
  },
  {
    id: "platform",
    title: "Platform modernization",
    description: "De-risk migrations, untangle legacy systems, and surface phased cutover plans without halting delivery.",
  },
  {
    id: "ai",
    title: "Intelligent copilots",
    description: "Deploy generative copilots across sales, support, and operations with measurable guardrails and human-in-the-loop controls.",
  },
];

const workflowData = {
  workflowHero,
  workflowMetrics,
  workflowPhases,
  workflowRituals,
  workflowShowcase,
  workflowAccelerators,
};

export default workflowData;

/** @module data/page/workflow/workflowData */
