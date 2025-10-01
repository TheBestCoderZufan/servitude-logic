// src/data/page/services/servicesData.js
import {
  FiLayers,
  FiShield,
  FiTrendingUp,
  FiBarChart,
  FiCommand,
  FiUsers,
  FiGitBranch,
  FiCompass,
  FiBox,
  FiZap,
} from "react-icons/fi";

/**
 * @typedef {Object} ServiceOffering
 * @property {string} id - Offering identifier.
 * @property {string} title - Offering title.
 * @property {string} description - Offering description.
 */

/**
 * @typedef {Object} ServiceCategory
 * @property {string} id - Category identifier.
 * @property {Function} icon - Icon used in the UI.
 * @property {string} label - Category label displayed to users.
 * @property {string} blurb - Supporting description for the category.
 * @property {Array<ServiceOffering>} offerings - Detailed offerings contained within the category.
 */

/**
 * @typedef {Object} StatHighlight
 * @property {string} id - Unique identifier for the metric.
 * @property {string} label - Metric label.
 * @property {number} value - Numeric value used for animation.
 * @property {string} suffix - Suffix displayed beside the value.
 * @property {string} description - Additional context.
 */

/**
 * @typedef {Object} IntegrationSlide
 * @property {string} id - Unique slide identifier.
 * @property {string} title - Slide eyebrow label.
 * @property {string} headline - Main slide headline.
 * @property {string} copy - Supporting slide copy.
 */

/**
 * @typedef {Object} JourneyPhase
 * @property {string} id - Phase identifier.
 * @property {string} title - Phase title.
 * @property {string} description - Phase description.
 */

/**
 * @typedef {Object} AcceleratorModule
 * @property {string} id - Module identifier.
 * @property {string} title - Module title.
 * @property {string} detail - Module description.
 */

/**
 * Hero content for the services landing page.
 * @type {{ eyebrow: string, heroTitle: string, heroSubtitle: string, primaryCta: { label: string, href: string }, secondaryCta: { label: string, href: string } }}
 */
export const servicesHero = {
  eyebrow: "What we deliver",
  heroTitle:
    "Full-stack software services built to ship and scale products that last",
  heroSubtitle:
    "From greenfield exploration to enterprise modernization, Servitude Logic assembles delivery pods, specialists, and operating systems that treat your roadmap like our own.",
  primaryCta: {
    label: "Plan a consultation",
    href: "/contact#contact-form",
  },
  secondaryCta: {
    label: "Download capabilities overview",
    href: "/api/downloads/services.pdf",
  },
};

/**
 * Structured catalogue of core service categories and offerings.
 * @type {Array<ServiceCategory>}
 */
export const serviceCatalog = [
  {
    id: "strategy",
    icon: FiCompass,
    label: "Strategy &amp; Discovery",
    blurb: "Bring clarity to markets, audiences, and KPIs before a single sprint begins.",
    offerings: [
      {
        id: "research",
        title: "Product &amp; market research",
        description: "Voice-of-customer interviews, competitor teardown, pricing validation, and roadmap prioritisation workshops.",
      },
      {
        id: "kpi",
        title: "KPI &amp; telemetry architecture",
        description: "Define north-star metrics, instrumentation plans, experimentation frameworks, and governance cadences.",
      },
      {
        id: "roadmap",
        title: "90-day delivery runway",
        description: "Immersion sprints that translate strategy into user journeys, service blueprints, and backlog foundations.",
      },
    ],
  },
  {
    id: "experience",
    icon: FiLayers,
    label: "Product &amp; Experience",
    blurb: "Design and build inclusive, high-performing interfaces that feel effortless to ship and maintain.",
    offerings: [
      {
        id: "ux",
        title: "Experience engineering",
        description: "Research-backed UX, UI systems, and motion language with WCAG 2.2 AAA accessibility baked in.",
      },
      {
        id: "delivery",
        title: "Full-stack product delivery",
        description: "Cross-functional squads covering frontend, backend, QA automation, and DevOps on modern stacks.",
      },
      {
        id: "platform",
        title: "Design systems &amp; documentation",
        description: "Token-driven libraries, Storybook coverage, and enablement guides to empower internal teams.",
      },
    ],
  },
  {
    id: "platform",
    icon: FiShield,
    label: "Platform &amp; Modernisation",
    blurb: "Harden infrastructure, evolve legacy systems, and ensure compliance without slowing releases.",
    offerings: [
      {
        id: "architecture",
        title: "Architecture &amp; modernization",
        description: "Cloud migrations, modular refactors, and API platform design aligned to scalability and cost targets.",
      },
      {
        id: "security",
        title: "Security &amp; compliance",
        description: "Threat modelling, SOC 2 / HIPAA readiness, and automated policy enforcement with evidence trails.",
      },
      {
        id: "dataops",
        title: "Data &amp; analytics engineering",
        description: "Data pipelines, warehousing, ML enablement, and observability to keep decisions grounded in truth.",
      },
    ],
  },
  {
    id: "growth",
    icon: FiTrendingUp,
    label: "Growth &amp; Lifecycle",
    blurb: "Activate acquisition, monetisation, and retention loops that compound value over time.",
    offerings: [
      {
        id: "activation",
        title: "Lifecycle automation",
        description: "Multi-channel onboarding, nurture, and expansion journeys paired with experiment frameworks.",
      },
      {
        id: "enablement",
        title: "Go-to-market enablement",
        description: "Sales playbooks, success workflows, and training assets to launch new capabilities confidently.",
      },
      {
        id: "analytics",
        title: "Revenue intelligence",
        description: "Attribution modelling, cohort analysis, and forecasting dashboards tuned for product and finance leadership.",
      },
    ],
  },
];

/**
 * Service packages summarising how clients engage with us.
 *
 * @typedef {Object} ServicePackage
 * @property {string} id - Package identifier.
 * @property {Function} icon - Icon used for the package.
 * @property {string} name - Package name.
 * @property {string} summary - Short description of the package focus.
 * @property {string} duration - Typical engagement duration.
 * @property {string} idealFor - Audience that benefits most.
 * @property {Array<string>} deliverables - Key deliverables included.
 *
 * @type {Array<ServicePackage>}
 */
export const servicePackages = [
  {
    id: "venture",
    icon: FiZap,
    name: "Venture velocity",
    summary: "Cross-functional pod that ships v1 experiences within 12 weeks, optimised for early-stage validation.",
    duration: "8-12 weeks",
    idealFor: "Seed to Series B teams launching net-new products",
    deliverables: ["Discovery &amp; product roadmap", "MVP design + engineering", "Launch instrumentation &amp; growth plan"],
  },
  {
    id: "scale",
    icon: FiBarChart,
    name: "Scale acceleration",
    summary: "Dedicated squads embedded alongside your team to expand features, improve UX, and mature operations.",
    duration: "Quarterly renewals",
    idealFor: "Scale-ups balancing roadmap expansion and platform hardening",
    deliverables: ["Quarterly outcomes roadmap", "Design system &amp; platform enhancements", "Lifecycle &amp; revenue experiment backlog"],
  },
  {
    id: "enterprise",
    icon: FiCommand,
    name: "Enterprise modernisation",
    summary: "Transformation programme aligning legacy platforms, compliance, and stakeholder enablement.",
    duration: "6-9 months",
    idealFor: "Growth-stage and enterprise organisations consolidating or evolving complex systems",
    deliverables: ["Architecture &amp; migration playbook", "Security &amp; compliance readiness", "Change management &amp; enablement toolkit"],
  },
];

/**
 * Animated stat highlights for credibility rail.
 * @type {Array<StatHighlight>}
 */
export const statHighlights = [
  {
    id: "activation",
    label: "Average activation lift",
    value: 163,
    suffix: "%",
    description: "Measured across post-launch onboarding funnels over the last twelve months.",
  },
  {
    id: "delivery",
    label: "Delivery velocity",
    value: 45,
    suffix: " days",
    description: "Median time from exploration to production for complex net-new initiatives.",
  },
  {
    id: "security",
    label: "Security review pass rate",
    value: 94,
    suffix: "%",
    description: "Enterprise security assessments sailed through on the first attempt thanks to proactive controls.",
  },
];

/**
 * Reveal.js carousel slides for service stories.
 * @type {Array<IntegrationSlide>}
 */
export const integrationShowcase = [
  {
    id: "atlas-growth",
    title: "Atlas Growth Cloud",
    headline: "Replatformed customer onboarding for five product lines in under ten weeks.",
    copy: "Unified KYC, usage metering, and billing orchestration with self-serve analytics. NPS climbed from 19 to 61 within a quarter.",
  },
  {
    id: "meridian-safety",
    title: "Meridian Safety",
    headline: "Delivered real-time compliance monitors that shielded a global workforce.",
    copy: "Edge analytics, automated SOPs, and human-in-the-loop escalations reduced downtime by 72%.",
  },
  {
    id: "nova-care",
    title: "Nova Care Collective",
    headline: "Designed patient journeys that blend empathy with unmatched throughput.",
    copy: "Conversational triage, adaptive scheduling, and proactive comms shrank waitlists by 41%.",
  },
];

/**
 * Journey phases rendered as timeline entries.
 * @type {Array<JourneyPhase>}
 */
export const journeyPhases = [
  {
    id: "launchpad",
    title: "Launchpad",
    description: "Immersion workshops, product telemetry wiring, and roadmap shaping within the first fortnight.",
  },
  {
    id: "build",
    title: "Build & orchestrate",
    description: "Parallelized delivery pods handle platform hardening, UX, and growth experiments in lockstep.",
  },
  {
    id: "amplify",
    title: "Amplify",
    description: "Launch enablement, observability, and revenue plays continue long after version one ships.",
  },
];

/**
 * Accelerator modules highlighting extra capabilities.
 * @type {Array<AcceleratorModule>}
 */
export const acceleratorModules = [
  {
    id: "copilots",
    title: "Applied AI copilots",
    detail: "Design and deploy copilots for support, operations, and product teams with clear guardrails and observability.",
  },
  {
    id: "compliance",
    title: "Compliance fast-track",
    detail: "SOC 2, HIPAA, and GDPR readiness built into delivery rituals so audits become a progress update, not a fire drill.",
  },
  {
    id: "talent",
    title: "Talent enablement",
    detail: "Playbooks, design systems, and onboarding paths that let your teams absorb Servitude Logic craftsmanship.",
  },
  {
    id: "scale",
    title: "Scale advisory",
    detail: "Architectural runway reviews and capacity modelling to keep teams performing as demand spikes.",
  },
];

/**
 * @typedef {Object} ServiceDifferentiator
 * @property {string} id - Identifier for the differentiator.
 * @property {Function} icon - Icon visualising the differentiator.
 * @property {string} title - Differentiator title.
 * @property {string} detail - Supporting copy.
 */

/**
 * Differentiators that clarify how engagements feel.
 * @type {Array<ServiceDifferentiator>}
 */
export const serviceDifferentiators = [
  {
    id: "pods",
    icon: FiUsers,
    title: "Specialist pods, zero ramp",
    detail: "Each engagement is staffed with people who have delivered in your industry before. No junior staffing experiments on your roadmap.",
  },
  {
    id: "ops",
    icon: FiGitBranch,
    title: "Operational excellence baked in",
    detail: "Release rituals, observability, and feedback loops are established from week one so velocity never sacrifices stability.",
  },
  {
    id: "handoff",
    icon: FiBox,
    title: "Enablement from day zero",
    detail: "Documentation, playbooks, and training assets are created alongside builds, ensuring your teams stay empowered after we roll off.",
  },
];

const servicesData = {
  servicesHero,
  serviceCatalog,
  servicePackages,
  statHighlights,
  integrationShowcase,
  journeyPhases,
  acceleratorModules,
  serviceDifferentiators,
};

export default servicesData;

/** @module data/page/services/servicesData */
