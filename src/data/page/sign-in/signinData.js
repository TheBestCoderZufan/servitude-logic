// src/data/page/signinData.js
import {
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiDollarSign,
  FiBarChart,
} from "react-icons/fi";
import appInfo from "@/data/appInfo.js";
/**
 * @typedef {Object} SignInFeature
 * @property {Function} icon - React icon component.
 * @property {string} text - Feature description.
 */
/**
 * Feature bullet items shown on the Sign‑In page to highlight product value.
 *
 * Used in `src/app/sign-in/[[...sign-in]]/page.js`.
 * @type {SignInFeature[]}
 */
export const features = [
  {
    icon: FiUsers,
    text: "Comprehensive " + appInfo.name.toLowerCase() + " management",
  },
  {
    icon: FiFolder,
    text: "Organized project tracking",
  },
  {
    icon: FiCheckSquare,
    text: "Advanced task management",
  },
  {
    icon: FiDollarSign,
    text: "Automated invoicing & billing",
  },
  {
    icon: FiBarChart,
    text: "Detailed analytics & reporting",
  },
];

/**
 * @typedef {Object} Testimonial
 * @property {number} id
 * @property {string} text
 * @property {string} authorInitials
 * @property {string} authorName
 * @property {string} authorTitle
 * @property {number} authorRating
 * @property {string} avatar
 */
/**
 * Simple testimonial data displayed under the sign‑in form.
 *
 * Used in `src/app/sign-in/[[...sign-in]]/page.js`.
 * @type {Testimonial[]}
 */
export const mockTestimonial = [
  {
    id: 1,
    text: `${appInfo.name} transformed how we manage our client projects. The intuitive interface and powerful features have significantly improved our team&apos;s productivity.`,
    authorInitials: "SK",
    authorName: "Sarah Kim",
    authorTitle: "Project Manager",
    authorRating: 4,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
];
