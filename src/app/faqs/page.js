// src/app/faqs/page.js
import Navigation from "@/components/Navigation/Navigation";
import appInfo from "@/data/appInfo";

export const metadata = {
  title: `${appInfo.name} | FAQs`,
  description: `Answers to common questions about collaborating with ${appInfo.name}, from onboarding through launch and growth.`,
  alternates: { canonical: "/faqs" },
};

const faqItems = [
  {
    question: "How quickly can Servitude Logic start?",
    answer:
      "Pods assemble within forty-eight hours. We align on governance, access, and measurement during a short immersion sprint so the first deliverables arrive in week one.",
  },
  {
    question: "Do you work with internal teams?",
    answer:
      "Absolutely. We embed alongside product, engineering, data, and operations partners. Shared telemetry and daily async rituals keep accountability crystal clear.",
  },
  {
    question: "What happens after launch?",
    answer:
      "Launch is the midpoint. Servitude Logic transitions into a growth cadence that blends experimentation, observability hardening, and proactive incident response.",
  },
  {
    question: "Can engagements scale up or down?",
    answer:
      "Yes. Capacity flexes via specialized guilds. Whether you need accessibility audits, AI copilots, or internationalization, we plug in modular specialists without disrupting momentum.",
  },
];

/**
 * FaqsPage
 * Public FAQ collection for Servitude Logic.
 *
 * @returns {JSX.Element} FAQ layout.
 */
export default function FaqsPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur">
        <Navigation />
      </div>
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-24 lg:px-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Frequently asked</p>
          <h1 className="font-heading text-4xl leading-tight md:text-5xl">Answers from the Servitude Logic team</h1>
          <p className="text-lg text-muted">
            If you do not see your question, send us a note at <a className="text-primary underline" href="mailto:hello@servitudelogic.com">hello@servitudelogic.com</a> and we will respond quickly.
          </p>
        </header>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm transition">
              <summary className="cursor-pointer font-heading text-xl text-foreground">
                {item.question}
              </summary>
              <p className="mt-3 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
        <footer className="rounded-3xl border border-primary bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 shadow-lifted">
          <h2 className="font-heading text-2xl md:text-3xl">Need a deeper dive?</h2>
          <p className="mt-3 text-muted">We will tailor a briefing that covers security, compliance, architecture, and delivery rituals specific to your organization.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground transition hover:bg-primary-hover" href="/services">Review services</a>
            <a className="rounded-lg border border-border px-6 py-3 text-center font-semibold text-foreground transition hover:border-primary hover:bg-accent-soft" href="/contact">Talk with us</a>
          </div>
        </footer>
      </section>
    </main>
  );
}

/** @module app/faqs/page */
