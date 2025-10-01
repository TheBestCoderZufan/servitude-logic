// src/lib/seo/jsonld.js

/**
 * Returns Organization JSON-LD.
 * @param {string} baseUrl - Site base URL
 * @param {string} name - Organization name
 * @returns {Object}
 */
export function organizationLd(baseUrl, name, extras = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    ...extras,
  };
}

/**
 * Returns WebSite JSON-LD with SearchAction.
 * @param {string} baseUrl - Site base URL
 * @param {string} name - Site name
 * @returns {Object}
 */
export function websiteLd(baseUrl, name) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: baseUrl,
    name,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Returns a WebPage-like JSON-LD entry.
 * @param {string} fullUrl - Absolute page URL
 * @param {string} type - WebPage subtype (e.g., AboutPage, ContactPage)
 * @param {string} name - Page title
 * @returns {Object}
 */
export function webPageLd(fullUrl, type, name) {
  return {
    "@context": "https://schema.org",
    "@type": type || "WebPage",
    url: fullUrl,
    name,
  };
}

/**
 * Returns a Service JSON-LD entry for marketing pages.
 *
 * @param {Object} options - Service metadata.
 * @param {string} options.base - Absolute base URL of the site.
 * @param {string} options.name - Display name of the service offering.
 * @param {string} options.description - Short description of the service.
 * @param {string} options.url - Canonical service URL.
 * @returns {Object}
 */
export function serviceLd({ base, name, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name,
      url: base,
    },
    url,
  };
}

/**
 * Returns a HowTo JSON-LD entry summarising workflow steps.
 *
 * @param {Object} options - HowTo definition.
 * @param {string} options.base - Base URL for provider reference.
 * @param {string} options.name - HowTo name.
 * @param {string} options.description - HowTo description.
 * @param {string} options.url - Canonical URL for the HowTo.
 * @param {Array<{name: string, description: string}>} options.steps - Ordered steps for the workflow.
 * @returns {Object}
 */
export function howToLd({ base, name, description, url, steps }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    provider: {
      "@type": "Organization",
      name,
      url: base,
    },
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      description: step.description,
    })),
    url,
  };
}

/** @module lib/seo/jsonld */
