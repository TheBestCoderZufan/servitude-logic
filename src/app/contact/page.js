// src/app/contact/page.js
import ContactPageClient from "./ContactPageClient";
import JsonLd from "@/components/seo/JsonLd";
import Navigation from "@/components/Navigation/Navigation";
import appInfo from "@/data/appInfo";
import { CONTACT_INFO, contactHero } from "@/data/page/contact/contactData";
import { organizationLd, webPageLd } from "@/lib/seo/jsonld";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" });

/**
 * metadata
 * SEO metadata for the contact page.
 *
 * @type {{ title: string, description: string, alternates: { canonical: string }, openGraph: object }}
 */
export const metadata = {
  title: "Contact",
  description: contactHero.subtitle,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `${appInfo.name} Contact`,
    description: contactHero.subtitle,
    url: "https://servitudelogic.com/contact",
    siteName: appInfo.name,
  },
};

/**
 * ContactPage
 * Server component orchestrating the contact experience.
 *
 * @returns {Promise<JSX.Element>} Contact page content rendered on the server.
 */
export default async function ContactPage() {
  const base = "https://servitudelogic.com";
  const ld = [
    organizationLd(base, appInfo.name, {
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: CONTACT_INFO.email,
          telephone: CONTACT_INFO.phone,
          areaServed: "Global",
          availableLanguage: ["en"],
        },
      ],
    }),
    webPageLd(`${base}/contact`, "ContactPage", "Contact"),
  ];

  return (
    <>
      <JsonLd data={ld} />
      <ContactPageClient
        navigation={<Navigation />}
        accentClassName={playfair.className}
        accentVariable={playfair.variable}
      />
    </>
  );
}

/** @module app/contact/page */
