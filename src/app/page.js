// src/app/page.js
import HomePageClient from "./HomePageClient";
import JsonLd from "@/components/seo/JsonLd";
import appInfo from "@/data/appInfo";
import { organizationLd, websiteLd, webPageLd } from "@/lib/seo/jsonld";
import Navigation from "@/components/Navigation/Navigation";

export const metadata = {
  title: `${appInfo.name} | Legendary Product Launch Partners`,
  description: `${appInfo.name} pairs elite product, design, and engineering talent to build unforgettable applications that convert, scale, and endure.`,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const base = "https://servitudelogic.com";
  const ld = [
    organizationLd(base, appInfo.name),
    websiteLd(base, appInfo.name),
    webPageLd(base + "/", "WebPage", "Home"),
  ];
  return (
    <>
      <JsonLd data={ld} />
      <HomePageClient navigation={<Navigation />} />
    </>
  );
}
