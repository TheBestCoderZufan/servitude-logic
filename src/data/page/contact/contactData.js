// src/data/page/contact/contactData.js
import {
  FiTarget,
  FiActivity,
  FiCalendar,
  FiUsers,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCompass,
  FiFileText,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";

/**
 * @typedef {Object} ContactAddress
 * @property {string} line1
 * @property {string} line2
 * @property {string} line3
 */

/**
 * @typedef {Object} ContactInfo
 * @property {string} email
 * @property {string} phone
 * @property {ContactAddress} address
 */

/**
 * Static contact information rendered on the Contact page.
 *
 * @type {ContactInfo}
 */
export const CONTACT_INFO = {
  email: "hello@webagency.com",
  phone: "+1 (555) 123-4567",
  address: {
    line1: "123 Innovation Street",
    line2: "Tech District, NY 10001",
    line3: "United States",
  },
};

/**
 * @typedef {Object} BusinessHoursItem
 * @property {string} label
 * @property {string} time
 */

/**
 * @typedef {Object} BusinessHours
 * @property {BusinessHoursItem} weekdays
 * @property {BusinessHoursItem} saturday
 * @property {BusinessHoursItem} sunday
 */

/**
 * Business hours displayed alongside contact info.
 *
 * @type {BusinessHours}
 */
export const BUSINESS_HOURS = {
  weekdays: { label: "Monday - Friday", time: "9:00 AM - 6:00 PM" },
  saturday: { label: "Saturday", time: "10:00 AM - 2:00 PM" },
  sunday: { label: "Sunday", time: "Closed" },
};

/**
 * @typedef {Object} ContactHero
 * @property {string} eyebrow
 * @property {string} title
 * @property {string} subtitle
 * @property {{ label: string, href: string }} primaryCta
 * @property {{ label: string, href: string }} secondaryCta
 */

/**
 * Hero content for the contact page.
 *
 * @type {ContactHero}
 */
export const contactHero = {
  eyebrow: "Start a partnership",
  title: "Design and ship the next chapter of your product portfolio",
  subtitle:
    "Share a few details and we will connect you with a delivery strategist who understands your industry, tech stack, and growth targets.",
  primaryCta: {
    label: "Email our team",
    href: `mailto:${CONTACT_INFO.email}`,
  },
  secondaryCta: {
    label: "Call us now",
    href: `tel:${CONTACT_INFO.phone.replace(/[^\d+]/g, "")}`,
  },
};

/**
 * @typedef {Object} ContactHighlight
 * @property {string} id
 * @property {Function} icon
 * @property {string} label
 */

/**
 * Quick highlights reinforcing responsiveness for prospects.
 *
 * @type {Array<ContactHighlight>}
 */
export const contactHighlights = [
  {
    id: "response-time",
    icon: FiCheckCircle,
    label: "Live reply within 2 business hours for new engagements",
  },
  {
    id: "specialists",
    icon: FiCheckCircle,
    label: "Dedicated strategist assigned before your first working session",
  },
  {
    id: "playbook",
    icon: FiCheckCircle,
    label: "Custom launch playbook delivered within 72 hours of kickoff",
  },
];

/**
 * @typedef {Object} ContactMetric
 * @property {string} id
 * @property {string} label
 * @property {number} value
 * @property {string} suffix
 * @property {string} description
 */

/**
 * Animated contact metrics.
 *
 * @type {Array<ContactMetric>}
 */
export const contactMetrics = [
  {
    id: "turnaround",
    label: "Average response time",
    value: 2,
    suffix: " hrs",
    description: "Time for a specialist to respond during business hours.",
  },
  {
    id: "nps",
    label: "Client satisfaction",
    value: 68,
    suffix: " NPS",
    description: "Rolling twelve-month Net Promoter Score across engagements.",
  },
  {
    id: "launches",
    label: "Launches supported",
    value: 47,
    suffix: "+",
    description: "Major product and initiative launches we shepherd annually.",
  },
];

/**
 * @typedef {Object} ContactChannel
 * @property {string} id
 * @property {Function} icon
 * @property {string} label
 * @property {string} value
 * @property {string} description
 * @property {string} href
 */

/**
 * Primary contact channels.
 *
 * @type {Array<ContactChannel>}
 */
export const contactChannels = [
  {
    id: "email",
    icon: FiMail,
    label: "Email",
    value: CONTACT_INFO.email,
    description: "Introductions, documentation, and follow-ups land here first.",
    href: `mailto:${CONTACT_INFO.email}`,
  },
  {
    id: "phone",
    icon: FiPhone,
    label: "Phone",
    value: CONTACT_INFO.phone,
    description: "Talk directly with a delivery strategist during office hours.",
    href: `tel:${CONTACT_INFO.phone.replace(/[^\d+]/g, "")}`,
  },
  {
    id: "hq",
    icon: FiMapPin,
    label: "HQ",
    value: `${CONTACT_INFO.address.line1}, ${CONTACT_INFO.address.line2}`,
    description: CONTACT_INFO.address.line3,
    href: "https://maps.app.goo.gl/" + encodeURIComponent(`${CONTACT_INFO.address.line1} ${CONTACT_INFO.address.line2}`),
  },
];

/**
 * @typedef {Object} ContactRitual
 * @property {string} id
 * @property {Function} icon
 * @property {string} title
 * @property {string} detail
 */

/**
 * Rituals describing the engagement kickoff.
 *
 * @type {Array<ContactRitual>}
 */
export const contactRituals = [
  {
    id: "discovery",
    icon: FiCompass,
    title: "Discovery workshop",
    detail: "Mixed-discipline sprint to capture goals, risks, and success signals with your stakeholders.",
  },
  {
    id: "playbook",
    icon: FiFileText,
    title: "Playbook delivery",
    detail: "Receive a custom delivery playbook outlining pods, rituals, and measurement cadences within 72 hours.",
  },
  {
    id: "kickstart",
    icon: FiSend,
    title: "Kickstart sprint",
    detail: "Pod integration, backlog mapping, and launch readiness planning all begin in week one.",
  },
];

/**
 * @typedef {Object} ContactShowcaseSlide
 * @property {string} id
 * @property {string} title
 * @property {string} headline
 * @property {string} copy
 */

/**
 * Reveal.js slides showcasing support artifacts.
 *
 * @type {Array<ContactShowcaseSlide>}
 */
export const contactShowcase = [
  {
    id: "touchpoints",
    title: "Touchpoint planner",
    headline: "Map every stakeholder ritual before the first sprint begins",
    copy: "A shared roadmap outlines ceremonies, agendas, and deliverables so your team knows exactly how collaboration unfolds week by week.",
  },
  {
    id: "observability",
    title: "Observability hub",
    headline: "Telemetry, sentiment, and financial signals in one command center",
    copy: "Dashboards capture adoption metrics, revenue trajectories, and support load so product and operations stay aligned.",
  },
  {
    id: "enablement",
    title: "Enablement library",
    headline: "Playbooks, looms, and templates keep momentum compounding",
    copy: "Self-serve resources help new stakeholders ramp quickly and extend Servitude Logic practices after launch.",
  },
];

/**
 * @typedef {Object} ContactFaq
 * @property {string} id
 * @property {string} question
 * @property {string} answer
 */

/**
 * Frequently asked questions for prospects.
 *
 * @type {Array<ContactFaq>}
 */
export const contactFaqs = [
  {
    id: "timelines",
    question: "How quickly can we start?",
    answer: "We typically schedule immersion workshops within five business days and deploy pods inside two weeks, depending on scope and access.",
  },
  {
    id: "pricing",
    question: "Do you support project-based pricing?",
    answer: "Yes. We offer both retainer and milestone-based structures tied to measurable outcomes and governance checkpoints.",
  },
  {
    id: "tooling",
    question: "Can you work within our existing toolchain?",
    answer: "Servitude Logic integrates with your preferred design, engineering, and analytics stack, supplementing only where capability gaps exist.",
  },
];

const contactData = {
  CONTACT_INFO,
  BUSINESS_HOURS,
  contactHero,
  contactMetrics,
  contactHighlights,
  contactChannels,
  contactRituals,
  contactShowcase,
  contactFaqs,
};

export default contactData;
