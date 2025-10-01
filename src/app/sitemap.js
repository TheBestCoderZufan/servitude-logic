// src/app/sitemap.js
/**
 * Generates a simple sitemap for public pages.
 * @returns {Promise<Array<{ url: string, lastModified: string }>>}
 */
export default async function sitemap() {
  const base = "https://servitudelogic.com";
  const paths = ["/", "/services", "/work", "/workflow", "/stories", "/faqs", "/pricing", "/contact"]; // public routes only
  const lastModified = new Date().toISOString();
  return paths.map((p) => ({ url: base + p, lastModified }));
}

/** @module app/sitemap */
