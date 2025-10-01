// src/app/stories/page.js
import Navigation from "@/components/Navigation/Navigation";
import appInfo from "@/data/appInfo";

export const metadata = {
  title: `${appInfo.name} | Stories`,
  description: `Explore how ${appInfo.name} pairs disciplined engineering with narrative UX to craft outcomes that investors and customers celebrate.`,
  alternates: { canonical: "/stories" },
};

/**
 * StoriesPage
 * Case story index for Servitude Logic wins and partnerships.
 *
 * @returns {JSX.Element} Stories landing view.
 */
export default function StoriesPage() {
  const stories = [
    {
      title: "Cortex Analytics",
      summary:
        "Brought a decade of ad-hoc dashboards into a cohesive analytics lab with governed pipelines, unified RBAC, and a launch that doubled net retention.",
      metric: "122% platform expansion",
    },
    {
      title: "Lumen Clinics",
      summary:
        "Redesigned scheduling and care pathways with accessibility at the core, shortening the pre-op journey from twenty forms to a five minute conversational flow.",
      metric: "4.3x patient satisfaction",
    },
    {
      title: "Outbound Labs",
      summary:
        "Built a prospect intelligence engine with generative summaries, streamlining BDR prep while ensuring privacy controls satisfied enterprise security reviews.",
      metric: "39% lift in enterprise conversions",
    },
  ];

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur">
        <Navigation />
      </div>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-24 lg:px-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Proof in the field</p>
          <h1 className="font-heading text-4xl leading-tight md:text-5xl">Stories that illustrate Servitude Logic&apos;s obsession with measurable impact</h1>
          <p className="text-lg text-muted">
            We co-create with founders, operators, and enterprise sponsors. Each story below highlights the choreography, telemetry, and craft that distinguish our partnerships.
          </p>
        </header>
        <div className="grid gap-8 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story.title} className="flex h-full flex-col justify-between rounded-3xl border border-border bg-surface/80 p-8 shadow-lifted">
              <div className="space-y-4">
                <h2 className="font-heading text-2xl">{story.title}</h2>
                <p className="text-muted">{story.summary}</p>
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary">{story.metric}</p>
            </article>
          ))}
        </div>
        <footer className="rounded-3xl border border-primary bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 shadow-lifted">
          <h2 className="font-heading text-2xl md:text-3xl">Let&apos;s craft the next Servitude Logic story together</h2>
          <p className="mt-3 text-muted">Share your ambition, and we will outline the roadmap, telemetry, and governance model to achieve it.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground transition hover:bg-primary-hover" href="/contact">Start a conversation</a>
            <a className="rounded-lg border border-border px-6 py-3 text-center font-semibold text-foreground transition hover:border-primary hover:bg-accent-soft" href="/services">Browse capabilities</a>
          </div>
        </footer>
      </section>
    </main>
  );
}

/** @module app/stories/page */
