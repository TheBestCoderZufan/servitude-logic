// src/data/page/home/homeData.js
import { FiHexagon, FiZap, FiCommand, FiLayers } from "react-icons/fi";
import appInfo from "@/data/appInfo";

/**
 * Hero content configuration for the landing page.
 * @type {Object}
 */
export const heroContent = {
  eyebrow: appInfo.name,
  heroTitle:
    "We craft enterprise-grade experiences that feel personal & unforgettable.",
  heroSubtitle:
    "Servitude Logic embeds with your crew to transform raw ideas into reliable products. Strategy, design, engineering, and launch &mdash; orchestrated in one sophisticated delivery rhythm.",
  primaryCta: {
    label: "Launch Your Initiative",
    href: "/contact",
  },
  secondaryCta: {
    label: "See Our Capabilities",
    href: "#capabilities",
  },
};

/**
 * Animated stats showcased in the credibility rail.
 * @type {Array<{id:string,label:string,value:number,suffix:string,description:string}>}
 */
export const kineticStats = [
  {
    id: "conversion",
    label: "Conversion lift",
    value: 187,
    suffix: "%",
    description: "Average post-launch lift on audited funnels.",
  },
  {
    id: "velocity",
    label: "Velocity",
    value: 6,
    suffix: " wks",
    description: "Median time from discovery to production-grade MVP.",
  },
  {
    id: "retention",
    label: "Client retention",
    value: 98,
    suffix: "%",
    description: "Partners that renew year-over-year for iterative growth.",
  },
];

/**
 * Core pillars rendered as animated cards.
 * @type {Array<{id:string,icon:Function,title:string,copy:string}>}
 */
export const craftPillars = [
  {
    id: "vision",
    icon: FiHexagon,
    title: "North-star Vision",
    copy: "Market intelligence, AI-assisted research, and workshops that surface the opportunities others miss.",
  },
  {
    id: "experience",
    icon: FiCommand,
    title: "Immersive Experience",
    copy: "Inclusive design, motion systems, and narrative UX that make every flow unmistakably yours.",
  },
  {
    id: "systems",
    icon: FiLayers,
    title: "End-to-end Systems",
    copy: "Composable architectures, infrastructure automation, and instrumentation that scale with confidence.",
  },
  {
    id: "launch",
    icon: FiZap,
    title: "Launch & Beyond",
    copy: "Incident-ready reliability, growth experiments, and revenue insights that keep outcomes compounding.",
  },
];

/**
 * Slide content injected into the Reveal.js carousel.
 * @type {Array<{id:string,title:string,headline:string,copy:string}>}
 */
export const immersionSlides = [
  {
    id: "atlas",
    title: "Atlas Fintech",
    headline:
      "Scaled onboarding across 42 countries without a single support fire.",
    copy: "We unified compliance workflows and payment orchestration, shipping the new experience in 10 weeks with a 121% activation jump.",
  },
  {
    id: "nova",
    title: "Nova Diagnostics",
    headline: "Patient scheduling collapsed from days to minutes.",
    copy: "A realtime availability engine, HIPAA-aligned portal, and bespoke analytics co-pilot that delivers 4x provider utilization.",
  },
  {
    id: "beacon",
    title: "Beacon Logistics",
    headline: "Logistics teams finally love their TMS.",
    copy: "Advanced routing intelligence, driver-native mobile interfaces, and a proactive incident desk reduced churn by 63%.",
  },
];

/**
 * Process milestones rendered with scroll-triggered reveals.
 * @type {Array<{id:string,title:string,description:string}>}
 */
export const processWaypoints = [
  {
    id: "immersion",
    title: "60-hour immersion",
    description:
      "Stakeholder interviews, product telemetry, and rapid prototyping collapse months of discovery into a single sprint.",
  },
  {
    id: "orchestration",
    title: "Modular orchestration",
    description:
      "Composable delivery playbooks tuned to your governance, with daily async status and live operations rooms when you need them.",
  },
  {
    id: "scale",
    title: "Scale on autopilot",
    description:
      "Infra as code, analytics, QA automation, and growth experiments continue shipping long after the initial launch.",
  },
];

/**
 * Social proof quotes featured in the closing call-to-action.
 * @type {Array<{id:string,quote:string,author:string,role:string}>}
 */
export const testimonials = [
  {
    id: "atlas-cto",
    quote:
      "Servitude Logic operates like an extension of our exec team. Every release arrives with telemetry, enablement, and a revenue story.",
    author: "Lena Ortiz",
    role: "CTO, Atlas Fintech",
  },
  {
    id: "nova-coo",
    quote:
      "The craftsmanship is unreal. They translated a maze of compliance constraints into an experience our patients rave about.",
    author: "Malcolm Price",
    role: "COO, Nova Diagnostics",
  },
  {
    id: "beacon-cpo",
    quote:
      "From product strategy to launch ops, they orchestrated a transformation that our investors still talk about.",
    author: "Ivy Chen",
    role: "CPO, Beacon Logistics",
  },
];

const homeData = {
  heroContent,
  kineticStats,
  craftPillars,
  immersionSlides,
  processWaypoints,
  testimonials,
};

export default homeData;
