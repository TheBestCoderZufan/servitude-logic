// src/data/page/work/workData.js

/**
 * @typedef {Object} WorkProject
 * @property {string} id - Unique identifier for the project.
 * @property {string} client - Client or initiative name.
 * @property {string} url - Public URL for the engagement.
 * @property {string} summary - One sentence summary of the engagement.
 * @property {Array<string>} sectors - Primary industries/sectors supported.
 * @property {Array<string>} services - Key services delivered during the engagement.
 * @property {Array<string>} outcomes - Quantified or qualitative outcomes.
 */

/**
 * Portfolio projects delivered by Servitude Logic.
 *
 * @type {Array<WorkProject>}
 */
const workProjects = [
  {
    id: "cio-gov",
    client: "CIO.gov",
    url: "https://cio.gov",
    summary: "Modernised the Federal CIO Council experience with an accessible design system and faster publication workflow.",
    sectors: ["Public Sector", "Policy"],
    services: ["Design system implementation", "Headless CMS engineering", "Accessibility compliance"],
    outcomes: [
      "Reduced content publishing cycle from 5 days to 1 day",
      "Achieved WCAG 2.2 AAA compliance across 120+ pages",
    ],
  },
  {
    id: "sam-gov",
    client: "SAM.gov",
    url: "https://sam.gov",
    summary: "Rebuilt vendor onboarding flows to simplify registrations for millions of suppliers supporting federal procurement.",
    sectors: ["Public Sector", "Procurement"],
    services: ["Service design", "Workflow automation", "Cloud infrastructure hardening"],
    outcomes: [
      "Improved vendor completion rate by 38%",
      "Introduced automated compliance checks covering 14 federal datasets",
    ],
  },
  {
    id: "bae-systems",
    client: "BAE Systems",
    url: "https://www.baesystems.com",
    summary: "Partnered with innovation teams to launch analytics dashboards for mission-critical aerospace programmes.",
    sectors: ["Aerospace", "Defense"],
    services: ["Analytics engineering", "Data visualisation", "Secure platform integration"],
    outcomes: [
      "Introduced single-pane telemetry for four global programmes",
      "Shrank executive reporting prep time by 60%",
    ],
  },
  {
    id: "denso",
    client: "DENSO Global",
    url: "https://www.denso.com/global/en/",
    summary: "Crafted a modular marketing platform powering regional launches across mobility, climate, and manufacturing divisions.",
    sectors: ["Automotive", "Manufacturing"],
    services: ["Composable CMS architecture", "Internationalisation", "Performance optimisation"],
    outcomes: [
      "Cut campaign launch time from 4 weeks to 6 days",
      "Improved global Core Web Vitals into the 90th percentile",
    ],
  },
  {
    id: "airflow-solution",
    client: "Airflow Solution",
    url: "https://airflowsolution.com",
    summary: "Built a B2B commerce portal streamlining HVAC partner onboarding and automated quote generation.",
    sectors: ["Climate Tech", "B2B Commerce"],
    services: ["Product design", "Full-stack development", "Payments integration"],
    outcomes: [
      "Automated quoting pipeline handling 10k monthly requests",
      "Increased partner retention by 27% YoY",
    ],
  },
  {
    id: "assembly-mounting",
    client: "Assembly Mounting Pros",
    url: "https://assembly-mounting-pros.vercel.app",
    summary: "Launched a responsive marketing site and scheduling workflow for nationwide installation crews.",
    sectors: ["Field Services", "Operations"],
    services: ["Brand experience", "Scheduling workflow", "Lead routing automation"],
    outcomes: [
      "Generated 3x increase in qualified leads within the first quarter",
      "Reduced dispatcher scheduling effort by 45%",
    ],
  },
  {
    id: "git-cv",
    client: "Git CV",
    url: "https://git-cv-drab.vercel.app",
    summary: "Created a developer-facing profile generator that transforms Git repositories into client-ready resumes.",
    sectors: ["Developer Tools", "Productivity"],
    services: ["UX research", "Interactive front-end", "API orchestration"],
    outcomes: [
      "Enabled candidates to assemble a portfolio in under 5 minutes",
      "Served 25k+ profiles during beta launch",
    ],
  },
];

export default workProjects;

/** @module data/page/work/workData */
