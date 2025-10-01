// src/app/workflow/page.js
import WorkflowPageClient from "./WorkflowPageClient";
import JsonLd from "@/components/seo/JsonLd";
import Navigation from "@/components/Navigation/Navigation";
import appInfo from "@/data/appInfo";
import { workflowHero, workflowPhases } from "@/data/page/workflow/workflowData";
import { organizationLd, webPageLd, howToLd } from "@/lib/seo/jsonld";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" });

/**
 * metadata
 * SEO metadata for the workflow landing page.
 *
 * @type {{ title: string, description: string, alternates: { canonical: string }, openGraph: object }}
 */
export const metadata = {
  title: "Workflow",
  description: workflowHero.heroSubtitle,
  alternates: { canonical: "/workflow" },
  openGraph: {
    title: `${appInfo.name} Workflow`,
    description: workflowHero.heroSubtitle,
    url: "https://servitudelogic.com/workflow",
    siteName: appInfo.name,
  },
};

/**
 * WorkflowPage
 * Server-rendered layout composing the workflow experience.
 *
 * @returns {Promise<JSX.Element>} Workflow marketing page content.
 */
export default async function WorkflowPage() {
  const base = "https://servitudelogic.com";
  const ld = [
    organizationLd(base, appInfo.name),
    webPageLd(`${base}/workflow`, "WebPage", "Workflow"),
    howToLd({
      base,
      name: `${appInfo.name} Delivery Workflow`,
      description: workflowHero.heroSubtitle,
      url: `${base}/workflow`,
      steps: workflowPhases.map((phase) => ({ name: phase.title, description: phase.description })),
    }),
  ];

  return (
    <>
      <JsonLd data={ld} />
      <WorkflowPageClient
        navigation={<Navigation />}
        accentClassName={playfair.className}
        accentVariable={playfair.variable}
      />
    </>
  );
}

/** @module app/workflow/page */
