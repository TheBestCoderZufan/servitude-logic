// src/data/page/workflow/workflowAnimationConfig.js
import { theme } from "@/styles/theme";

const accentPalette = theme.colors.accent;

/**
 * @typedef {Object} WorkflowTimelineStep
 * @property {string} selector - CSS selector targeted by the GSAP timeline.
 * @property {Object} vars - GSAP animation configuration.
 * @property {string|number} [position] - Optional timeline position string.
 */

/**
 * workflowParticleOptions
 * Particle options for the workflow hero background.
 *
 * @type {Object}
 */
export const workflowParticleOptions = {
  background: { color: "transparent" },
  detectRetina: true,
  fpsLimit: 60,
  particles: {
    number: { value: 32, density: { enable: true, area: 720 } },
    color: { value: [accentPalette.lagoon, accentPalette.electric, accentPalette.aurora] },
    opacity: {
      value: 0.36,
      anim: { enable: true, speed: 0.7, opacity_min: 0.1, sync: false },
    },
    size: {
      value: { min: 1, max: 5 },
      anim: { enable: true, speed: 2.8, size_min: 0.5, sync: false },
    },
    move: {
      enable: true,
      speed: 1.6,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "out" },
    },
    links: {
      enable: true,
      distance: 160,
      color: accentPalette.electric,
      opacity: 0.25,
      width: 1,
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "repulse" },
      resize: true,
    },
    modes: {
      repulse: { distance: 140, duration: 0.45 },
    },
  },
};

/**
 * workflowAosConfig
 * Default AOS configuration for the page.
 *
 * @type {Object}
 */
export const workflowAosConfig = {
  duration: 900,
  easing: "ease-out-quart",
  once: true,
  offset: 72,
};

/**
 * workflowTimelineDefaults
 * Shared GSAP defaults for hero timeline.
 *
 * @type {Object}
 */
export const workflowTimelineDefaults = {
  ease: "power3.out",
};

/**
 * workflowTimelineSteps
 * Step configuration for the GSAP hero animation.
 *
 * @type {Array<WorkflowTimelineStep>}
 */
export const workflowTimelineSteps = [
  {
    selector: "[data-workflow-eyebrow]",
    vars: { y: 26, opacity: 0, duration: 0.45 },
  },
  {
    selector: "[data-workflow-heading]",
    vars: { y: 34, opacity: 0, duration: 0.65 },
    position: "-=0.15",
  },
  {
    selector: "[data-workflow-subtitle]",
    vars: { y: 28, opacity: 0, duration: 0.6 },
    position: "-=0.25",
  },
  {
    selector: "[data-workflow-actions]",
    vars: { y: 20, opacity: 0, duration: 0.45 },
    position: "-=0.25",
  },
];

/**
 * workflowCounterAnimation
 * Anime.js settings for numeric counters.
 *
 * @type {Object}
 */
export const workflowCounterAnimation = {
  duration: 1900,
  easing: "easeOutQuart",
  round: 1,
};

/**
 * workflowSpringConfig
 * React Spring settings for ritual cards.
 *
 * @type {Object}
 */
export const workflowSpringConfig = {
  mass: 1,
  tension: 240,
  friction: 26,
};

/**
 * workflowRevealConfig
 * Reveal.js carousel configuration.
 *
 * @type {Object}
 */
export const workflowRevealConfig = {
  embedded: true,
  controls: false,
  progress: false,
  slideNumber: false,
  loop: true,
  transition: "fade",
  transitionSpeed: "slow",
};

/**
 * workflowLottieOptions
 * Baseline Lottie configuration.
 *
 * @type {Object}
 */
export const workflowLottieOptions = {
  loop: true,
  autoplay: true,
  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
};

const workflowAnimationConfig = {
  workflowParticleOptions,
  workflowAosConfig,
  workflowTimelineDefaults,
  workflowTimelineSteps,
  workflowCounterAnimation,
  workflowSpringConfig,
  workflowRevealConfig,
  workflowLottieOptions,
};

export default workflowAnimationConfig;

/** @module data/page/workflow/workflowAnimationConfig */
