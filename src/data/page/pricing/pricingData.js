// src/data/page/pricing/pricingData.js
/**
 * Billing frequency toggle values for the pricing page.
 *
 * Used in `src/app/pricing/page.js` to switch displayed prices.
 * @type {string[]}
 */
export const billingFrequencies = ["monthly", "yearly"]; // toggle options

/**
 * @typedef {Object} PricingPlan
 * @property {string} id - Plan identifier.
 * @property {string} title - Visible plan title.
 * @property {string} summary - Short description of the plan.
 * @property {number} [buildCost] - One‑time build cost if applicable.
 * @property {{ monthly: number, yearly: number }} [hosting] - Hosting costs.
 * @property {{ nonPremiumYearly: number }} [domain] - Domain pricing.
 * @property {string[]} [features] - Feature bullet points.
 * @property {{ label: string, href: string }} cta - Primary call to action.
 * @property {string} [badge] - Optional badge label.
 * @property {boolean} [contactOnly] - If true, hides price in favor of contact CTA.
 */
/**
 * Pricing plans configuration displayed on the pricing page.
 *
 * Consumed by `src/app/pricing/page.js` to render plan cards and CTAs.
 * @type {PricingPlan[]}
 */
export const plans = [
  {
    id: "build",
    title: "Build — Front‑End Only (0–10 pages)",
    summary:
      "Launch a modern, responsive front‑end site. No servers, databases, or auth.",
    buildCost: 0,
    hosting: { monthly: 20, yearly: 240 },
    domain: { nonPremiumYearly: 15 },
    features: [
      "Up to 10 pages included",
      "Responsive layouts and accessibility best practices",
      "Basic SEO metadata & sitemap",
      "Favicon and analytics hookup on request",
    ],
    cta: { label: "Start for Free", href: "/sign-up" },
    badge: "Popular",
  },
  {
    id: "enterprise",
    title: "Business & Enterprise",
    summary: "Complex web apps, integrations, dashboards, and custom workflows.",
    contactOnly: true,
    features: [
      "Custom web applications and internal tools",
      "APIs, integrations, and auth",
      "Design systems, dashboards, and role‑based access",
      "Scalable architecture and performance tuning",
    ],
    cta: { label: "Contact Us", href: "/contact" },
  },
];
