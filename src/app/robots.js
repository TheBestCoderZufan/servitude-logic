// src/app/robots.js
export default function robots() {
  const base = "https://servitudelogic.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: "servitudelogic.com",
  };
}

/** @module app/robots */

