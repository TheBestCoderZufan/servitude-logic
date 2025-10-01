// src/data/page/services/servicesAnimationConfig.js
import { theme } from "@/styles/theme";

const accentPalette = theme.colors.accent;

/**
 * @typedef {Object} ServicesTimelineStep
 * @property {string} selector - CSS selector targeted by the GSAP step.
 * @property {Object} vars - GSAP configuration for the step.
 * @property {string|number} [position] - Optional position parameter used when sequencing.
 */

/**
 * servicesParticleOptions
 * Particle engine options for the services hero background.
 *
 * @type {Object}
 */
export const servicesParticleOptions = {
  background: { color: "transparent" },
  detectRetina: true,
  fpsLimit: 60,
  particles: {
    number: { value: 36, density: { enable: true, area: 780 } },
    color: { value: [accentPalette.aurora, accentPalette.amethyst, accentPalette.aqua] },
    opacity: {
      value: 0.42,
      anim: { enable: true, speed: 0.8, opacity_min: 0.08, sync: false },
    },
    size: {
      value: { min: 1, max: 4 },
      anim: { enable: true, speed: 2.4, size_min: 0.4, sync: false },
    },
    move: {
      enable: true,
      speed: 1.8,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "out" },
      trail: { enable: false },
    },
    links: {
      enable: true,
      distance: 150,
      color: accentPalette.aurora,
      opacity: 0.25,
      width: 1,
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "grab" },
      resize: true,
    },
    modes: {
      grab: {
        distance: 160,
        links: { opacity: 0.4 },
      },
      repulse: { distance: 120, duration: 0.4 },
    },
  },
};

/**
 * servicesAosConfig
 * Scroll animation defaults used across the services page.
 *
 * @type {Object}
 */
export const servicesAosConfig = {
  duration: 900,
  easing: "ease-out-quart",
  offset: 80,
  once: true,
};

/**
 * servicesTimelineDefaults
 * Default GSAP easing configuration for hero animations.
 *
 * @type {Object}
 */
export const servicesTimelineDefaults = {
  ease: "power3.out",
};

/**
 * servicesTimelineSteps
 * Ordered GSAP timeline steps executed for hero entrances.
 *
 * @type {Array<ServicesTimelineStep>} */
export const servicesTimelineSteps = [
  {
    selector: "[data-services-eyebrow]",
    vars: { y: 28, opacity: 0, duration: 0.5 },
  },
  {
    selector: "[data-services-heading]",
    vars: { y: 36, opacity: 0, duration: 0.7 },
    position: "-=0.2",
  },
  {
    selector: "[data-services-subtitle]",
    vars: { y: 32, opacity: 0, duration: 0.7 },
    position: "-=0.3",
  },
  {
    selector: "[data-services-actions]",
    vars: { y: 24, opacity: 0, duration: 0.5 },
    position: "-=0.25",
  },
  {
    selector: "[data-services-insight]",
    vars: { y: 24, opacity: 0, duration: 0.55 },
    position: "-=0.25",
  },
];

/**
 * servicesCounterAnimation
 * Anime.js configuration for stat counters.
 *
 * @type {Object}
 */
export const servicesCounterAnimation = {
  duration: 2000,
  easing: "easeOutQuart",
  round: 1,
};

/**
 * servicesSpringConfig
 * React Spring configuration reused across service cards.
 *
 * @type {Object}
 */
export const servicesSpringConfig = {
  mass: 1,
  tension: 220,
  friction: 28,
};

/**
 * servicesRevealConfig
 * Reveal.js options for the integration carousel.
 *
 * @type {Object}
 */
export const servicesRevealConfig = {
  embedded: true,
  controls: false,
  progress: false,
  slideNumber: false,
  loop: true,
  transition: "fade",
  transitionSpeed: "slow",
};

/**
 * servicesLottieOptions
 * Base Lottie configuration leveraged by the hero animation.
 *
 * @type {Object}
 */
export const servicesLottieOptions = {
  loop: true,
  autoplay: true,
  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
};

const servicesAnimationConfig = {
  servicesParticleOptions,
  servicesAosConfig,
  servicesTimelineDefaults,
  servicesTimelineSteps,
  servicesCounterAnimation,
  servicesSpringConfig,
  servicesRevealConfig,
  servicesLottieOptions,
};

export default servicesAnimationConfig;

/** @module data/page/services/servicesAnimationConfig */
