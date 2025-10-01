// src/data/page/contact/contactAnimationConfig.js
import { theme } from "@/styles/theme";

const accentPalette = theme.colors.accent;

/**
 * @typedef {Object} ContactTimelineStep
 * @property {string} selector - CSS selector for the GSAP step.
 * @property {Object} vars - GSAP configuration object.
 * @property {string|number} [position] - Optional timeline position descriptor.
 */

/**
 * contactParticleOptions
 * Configuration for the tsparticles hero background.
 *
 * @type {Object}
 */
export const contactParticleOptions = {
  background: { color: "transparent" },
  detectRetina: true,
  fpsLimit: 60,
  particles: {
    number: { value: 28, density: { enable: true, area: 680 } },
    color: { value: [accentPalette.lagoon, accentPalette.aurora, accentPalette.aqua] },
    opacity: {
      value: 0.36,
      anim: { enable: true, speed: 0.8, opacity_min: 0.12, sync: false },
    },
    size: {
      value: { min: 1, max: 5 },
      anim: { enable: true, speed: 2.6, size_min: 0.4, sync: false },
    },
    move: {
      enable: true,
      speed: 1.5,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "out" },
    },
    links: {
      enable: true,
      distance: 150,
      color: accentPalette.aurora,
      opacity: 0.24,
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
        distance: 140,
        links: { opacity: 0.4 },
      },
    },
  },
};

/**
 * contactAosConfig
 * Shared AOS configuration for scroll animations.
 *
 * @type {Object}
 */
export const contactAosConfig = {
  duration: 900,
  easing: "ease-out-quart",
  once: true,
  offset: 70,
};

/**
 * contactTimelineDefaults
 * GSAP defaults for the hero entrance timeline.
 *
 * @type {Object}
 */
export const contactTimelineDefaults = {
  ease: "power3.out",
};

/**
 * contactTimelineSteps
 * Ordered steps used for the GSAP hero timeline.
 *
 * @type {Array<ContactTimelineStep>}
 */
export const contactTimelineSteps = [
  {
    selector: "[data-contact-eyebrow]",
    vars: { y: 24, opacity: 0, duration: 0.45 },
  },
  {
    selector: "[data-contact-heading]",
    vars: { y: 32, opacity: 0, duration: 0.65 },
    position: "-=0.2",
  },
  {
    selector: "[data-contact-subtitle]",
    vars: { y: 28, opacity: 0, duration: 0.6 },
    position: "-=0.25",
  },
  {
    selector: "[data-contact-highlights]",
    vars: { y: 26, opacity: 0, duration: 0.55 },
    position: "-=0.2",
  },
  {
    selector: "[data-contact-actions]",
    vars: { y: 18, opacity: 0, duration: 0.45 },
    position: "-=0.25",
  },
];

/**
 * contactCounterAnimation
 * Anime.js configuration for hero counters.
 *
 * @type {Object}
 */
export const contactCounterAnimation = {
  duration: 2000,
  easing: "easeOutQuart",
  round: 1,
};

/**
 * contactSpringConfig
 * React Spring configuration for channel and ritual cards.
 *
 * @type {Object}
 */
export const contactSpringConfig = {
  mass: 1,
  tension: 230,
  friction: 28,
};

/**
 * contactRevealConfig
 * Reveal.js configuration for showcase carousel.
 *
 * @type {Object}
 */
export const contactRevealConfig = {
  embedded: true,
  controls: false,
  progress: false,
  slideNumber: false,
  loop: true,
  transition: "fade",
  transitionSpeed: "slow",
};

/**
 * contactLottieOptions
 * Baseline Lottie configuration used by the hero illustration.
 *
 * @type {Object}
 */
export const contactLottieOptions = {
  loop: true,
  autoplay: true,
  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
};

const contactAnimationConfig = {
  contactParticleOptions,
  contactAosConfig,
  contactTimelineDefaults,
  contactTimelineSteps,
  contactCounterAnimation,
  contactSpringConfig,
  contactRevealConfig,
  contactLottieOptions,
};

export default contactAnimationConfig;

/** @module data/page/contact/contactAnimationConfig */
