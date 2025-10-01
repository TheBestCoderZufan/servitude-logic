// src/app/services/page.js
import ServicesPageClient from "./ServicesPageClient";
import JsonLd from "@/components/seo/JsonLd";
import Navigation from "@/components/Navigation/Navigation";
import appInfo from "@/data/appInfo";
import { servicesHero } from "@/data/page/services/servicesData";
import { organizationLd, webPageLd, serviceLd } from "@/lib/seo/jsonld";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" });

/**
 * metadata
 * SEO metadata for the services landing page.
 *
 * @type {{ title: string, description: string, alternates: { canonical: string }, openGraph: object }}
 */
export const metadata = {
  title: "Services",
  description: servicesHero.heroSubtitle,
  alternates: { canonical: "/services" },
  openGraph: {
    title: `${appInfo.name} Services`,
    description: servicesHero.heroSubtitle,
    url: "https://servitudelogic.com/services",
    siteName: appInfo.name,
  },
};

/**
 * ServicesPage
 * Server component that composes the services experience.
 *
 * @returns {Promise<JSX.Element>} Services page JSX rendered on the server.
 */
export default async function ServicesPage() {
  const base = "https://servitudelogic.com";
  const ld = [
    organizationLd(base, appInfo.name),
    webPageLd(`${base}/services`, "WebPage", "Services"),
    serviceLd({
      base,
      name: `${appInfo.name} Services`,
      description: servicesHero.heroSubtitle,
      url: `${base}/services`,
    }),
  ];

  return (
    <>
      <JsonLd data={ld} />
      <ServicesPageClient navigation={<Navigation />} accentClassName={playfair.className} accentVariable={playfair.variable} />
    </>
  );
}
