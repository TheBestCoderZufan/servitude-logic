// src/app/work/page.js
import Navigation from "@/components/Navigation/Navigation";
import JsonLd from "@/components/seo/JsonLd";
import appInfo from "@/data/appInfo";
import workProjects from "@/data/page/work/workData";
import { organizationLd, webPageLd } from "@/lib/seo/jsonld";

/**
 * metadata
 * SEO metadata for the Work page.
 *
 * @type {{ title: string, description: string, alternates: { canonical: string }, openGraph: object }}
 */
export const metadata = {
  title: "Work",
  description: "Selected case studies that highlight how Servitude Logic helps public sector, enterprise, and startup teams ship ambitious software.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: `${appInfo.name} Work`,
    description: "Selected case studies that highlight how Servitude Logic helps public sector, enterprise, and startup teams ship ambitious software.",
    url: "https://servitudelogic.com/work",
    siteName: appInfo.name,
  },
};

/**
 * WorkPage
 * Server-rendered collection of Servitude Logic portfolio projects.
 *
 * @returns {Promise<JSX.Element>} Work page content.
 */
export default async function WorkPage() {
  const base = "https://servitudelogic.com";
  const ld = [
    organizationLd(base, appInfo.name),
    webPageLd(`${base}/work`, "CollectionPage", "Work"),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Servitude Logic case studies",
      itemListElement: workProjects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: project.url,
        name: project.client,
        description: project.summary,
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd data={ld} />
      <div aria-label="Public navigation" className="sticky top-0 z-20 bg-background/80 backdrop-blur">
        <Navigation />
      </div>

      <header className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-16 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Selected work</p>
        <h1 className="font-heading text-4xl leading-tight md:text-5xl">Software engagements that pair outcomes with enablement</h1>
        <p className="max-w-3xl text-lg text-muted">
          From federal platforms to high-growth SaaS, these case studies showcase how Servitude Logic blends strategy, delivery, and growth to help partners launch faster, scale responsibly, and empower their teams.
        </p>
      </header>

      <section className="mx-auto mb-20 w-full max-w-6xl px-6" aria-labelledby="work-projects-heading">
        <h2 id="work-projects-heading" className="sr-only">
          Case studies
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          {workProjects.map((project) => (
            <article key={project.id} className="flex flex-col gap-5 rounded-3xl border border-border bg-surface/80 p-8 shadow-lifted">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-wide text-primary">
                  {project.sectors.map((sector) => (
                    <span key={`${project.id}-${sector}`} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {sector}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-semibold text-foreground">{project.client}</h3>
                <p className="text-base text-muted">{project.summary}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Services delivered</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {project.services.map((service) => (
                    <li key={`${project.id}-${service}`}>{service}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Outcomes</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {project.outcomes.map((outcome) => (
                    <li key={`${project.id}-${outcome}`}>{outcome}</li>
                  ))}
                </ul>
              </div>
              <div>
                <a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit project site
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

/** @module app/work/page */
