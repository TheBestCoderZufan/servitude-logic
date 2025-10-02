// src/app/contact/ContactPageClient.jsx
"use client";
/**
 * @module app/contact/ContactPageClient
 */
import "aos/dist/aos.css";
import "reveal.js/dist/reveal.css";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import gsap from "gsap";
import Reveal from "reveal.js";
import AOS from "aos";
import { animate } from "animejs";
import { animated, useSprings } from "@react-spring/web";
import Lottie from "react-lottie";
import { loadSlim } from "@tsparticles/slim";
import Button from "@/components/ui/shadcn/Button";
import heroOrb from "@/data/animations/heroOrb.json";
import appInfo from "@/data/appInfo";
import contactData from "@/data/page/contact/contactData";
import {
  contactParticleOptions,
  contactAosConfig,
  contactTimelineDefaults,
  contactTimelineSteps,
  contactCounterAnimation,
  contactSpringConfig,
  contactRevealConfig,
  contactLottieOptions,
} from "@/data/page/contact/contactAnimationConfig";

const Particles = dynamic(async () => {
  const mod = await import("@tsparticles/react");
  return mod.Particles;
}, { ssr: false });

const AnimatedChannelCard = animated.a;
const AnimatedRitualCard = animated.div;

/**
 * useParticleInit
 * Loads the tsparticles slim bundle only when needed.
 *
 * @returns {Function} Initialization callback.
 */
function useParticleInit() {
  const init = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);
  return init;
}

/**
 * useParticleOptions
 * Memoizes the particle configuration.
 *
 * @returns {Object}
 */
function useParticleOptions() {
  return useMemo(() => contactParticleOptions, []);
}

/**
 * useGsapHero
 * Configures the hero entrance timeline.
 *
 * @param {React.RefObject<HTMLElement>} scopeRef - Hero wrapper ref.
 */
function useGsapHero(scopeRef) {
  useEffect(() => {
    if (!scopeRef.current) {
      return undefined;
    }
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: contactTimelineDefaults });
      contactTimelineSteps.forEach(({ selector, vars, position }) => {
        if (position) {
          timeline.from(selector, vars, position);
        } else {
          timeline.from(selector, vars);
        }
      });
    }, scopeRef);
    return () => context.revert();
  }, [scopeRef]);
}

/**
 * useCounterRefs
 * Allocates mutable refs for counters animated by Anime.js.
 *
 * @param {number} count - Number of counters.
 * @returns {React.MutableRefObject<Array<HTMLElement|null>>}
 */
function useCounterRefs(count) {
  const refs = useRef(new Array(count).fill(null));
  return refs;
}

/**
 * useAnimateCounters
 * Kicks off Anime.js number animations.
 *
 * @param {React.MutableRefObject<Array<HTMLElement|null>>} counterRefs - Counter refs.
 * @param {number} total - Counter count.
 */
function useAnimateCounters(counterRefs, total) {
  useEffect(() => {
    const nodes = counterRefs.current.slice(0, total).filter(Boolean);
    if (!nodes.length) {
      return undefined;
    }
    const animation = animate(nodes, {
      ...contactCounterAnimation,
      innerHTML: (_, index) => [0, Number(nodes[index]?.dataset?.target ?? 0)],
    });
    return () => animation?.pause();
  }, [counterRefs, total]);
}

/**
 * useCardSprings
 * Creates spring animations for cards.
 *
 * @param {number} count - Number of cards.
 * @param {number} baseDelay - Initial delay in milliseconds.
 * @returns {Array} Spring values.
 */
function useCardSprings(count, baseDelay) {
  const [springs, api] = useSprings(count, () => ({ opacity: 0, y: 24, scale: 0.95 }));
  useEffect(() => {
    api.start((index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      delay: baseDelay + index * 110,
      config: contactSpringConfig,
    }));
  }, [api, baseDelay]);
  return springs;
}

/**
 * useRevealCarousel
 * Initializes Reveal.js for the showcase slides.
 *
 * @param {React.RefObject<HTMLDivElement>} deckRef - Reveal container ref.
 * @param {number} slideCount - Number of slides present.
 */
function useRevealCarousel(deckRef, slideCount) {
  useEffect(() => {
    if (!deckRef.current) {
      return undefined;
    }
    const deck = new Reveal(deckRef.current, contactRevealConfig);
    deck.initialize();
    return () => deck.destroy();
  }, [deckRef, slideCount]);
}

/**
 * useAosAnimation
 * Bootstraps Animate On Scroll.
 */
function useAosAnimation() {
  useEffect(() => {
    AOS.init(contactAosConfig);
  }, []);
}

/**
 * ContactPageClient
 * Animated, data-driven contact experience powered by Tailwind and shadcn components.
 *
 * @param {Object} props - Component props.
 * @param {JSX.Element|null} props.navigation - Server-rendered navigation element.
 * @param {string} [props.accentClassName] - Accent font class.
 * @param {string} [props.accentVariable] - Accent font variable.
 * @returns {JSX.Element}
 */
export default function ContactPageClient({ navigation, accentClassName = "", accentVariable = "" }) {
  const {
    CONTACT_INFO,
    BUSINESS_HOURS,
    contactHero,
    contactMetrics,
    contactHighlights,
    contactChannels,
    contactRituals,
    contactShowcase,
    contactFaqs,
  } = contactData;
  const heroRef = useRef(null);
  const deckRef = useRef(null);
  const counterRefs = useCounterRefs(contactMetrics.length);
  const handleParticlesInit = useParticleInit();
  const particleOptions = useParticleOptions();
  const lottieOptions = useMemo(() => ({ ...contactLottieOptions, animationData: heroOrb }), []);
  const channelSprings = useCardSprings(contactChannels.length, 280);
  const ritualSprings = useCardSprings(contactRituals.length, 340);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    budget: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  useGsapHero(heroRef);
  useAosAnimation();
  useRevealCarousel(deckRef, contactShowcase.length);
  useAnimateCounters(counterRefs, contactMetrics.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      setSubmissionMessage("");
      try {
        await new Promise((resolve) => setTimeout(resolve, 900));
        setFormState({ name: "", email: "", phone: "", company: "", budget: "", message: "" });
        setSubmissionMessage("Thanks for reaching out. A strategist will respond shortly.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return (
    <main className={`${accentVariable} min-h-screen bg-background text-foreground`}>
      <div aria-label="Public navigation" className="sticky top-0 z-20 bg-background/80 backdrop-blur">
        {navigation}
      </div>
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_58%),radial-gradient(circle_at_bottom,_rgba(99,102,241,0.22),_transparent_62%)]"
      >
        <div className="absolute inset-0">
          <Particles id="contact-particles" init={handleParticlesInit} options={particleOptions} />
          <div className="absolute inset-0 bg-gradient-to-br from-background/72 via-background/45 to-background/92" aria-hidden="true" />
        </div>
        <div className="relative z-[1] mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16 lg:py-28">
          <div className="flex flex-col gap-6">
            <span
              data-contact-eyebrow
              className="inline-flex max-w-max items-center gap-2 rounded-full border border-border bg-background/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
            >
              <span aria-hidden="true">📡</span>
              {contactHero.eyebrow}
            </span>
            <h1
              data-contact-heading
              className={`${accentClassName} text-4xl leading-tight md:text-5xl lg:text-6xl`}
              dangerouslySetInnerHTML={{ __html: contactHero.title }}
            />
            <p data-contact-subtitle className="max-w-2xl text-lg text-muted md:text-xl">
              {contactHero.subtitle}
            </p>
            <ul
              data-contact-highlights
              className="mt-2 space-y-3 text-base text-foreground"
            >
              {contactHighlights.map((highlight) => {
                const Icon = highlight.icon;
                return (
                  <li key={highlight.id} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="text-sm text-muted md:text-base">{highlight.label}</span>
                  </li>
                );
              })}
            </ul>
            <div data-contact-actions className="mt-4 flex flex-col gap-4 sm:flex-row" role="group" aria-label="Contact actions">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => {
                  window.location.href = contactHero.primaryCta.href;
                }}
              >
                {contactHero.primaryCta.label}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => {
                  window.location.href = contactHero.secondaryCta.href;
                }}
              >
                {contactHero.secondaryCta.label}
              </Button>
            </div>
            <p className="text-sm text-muted">
              Current theme mode:&nbsp;
              <span className="font-semibold text-foreground" aria-live="polite">
                {mounted ? resolvedTheme ?? "light" : "light"}
              </span>
            </p>
          </div>
          <div className="relative flex w-full flex-col gap-6">
            <div className="rounded-3xl border border-border bg-surface/90 p-8 shadow-lifted backdrop-blur">
              <div className="mb-6 flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/15 p-2">
                  <Lottie options={lottieOptions} height={48} width={48} isClickToPauseDisabled aria-label="Animated contact illustration" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">Quick intro</p>
                  <p className="text-sm text-muted">Complete this form and we&apos;ll respond within two business hours.</p>
                </div>
              </div>
              <form id="contact-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  Full name
                  <input
                    required
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    autoComplete="name"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-inner focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    placeholder="Jordan Walker"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  Work email
                  <input
                    required
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-inner focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    placeholder="jordan@example.com"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  Phone (optional)
                  <input
                    type="tel"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-inner focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    placeholder="+1 555 123 4567"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  Company
                  <input
                    type="text"
                    name="company"
                    value={formState.company}
                    onChange={handleChange}
                    autoComplete="organization"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-inner focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    placeholder="Acme Labs"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  Estimated budget
                  <select
                    name="budget"
                    value={formState.budget}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-inner focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <option value="">Select an option</option>
                    <option value="under-50k">Under $50k</option>
                    <option value="50k-100k">$50k - $100k</option>
                    <option value="100k-250k">$100k - $250k</option>
                    <option value="250k+">$250k+</option>
                    <option value="unsure">Still exploring</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  How can we help?
                  <textarea
                    required
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    className="min-h-[140px] w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-inner focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    placeholder="Share goals, timelines, audiences, or specific deliverables you have in mind."
                  />
                </label>
                <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
                  {isSubmitting ? "Sending..." : "Submit inquiry"}
                </Button>
                {submissionMessage ? (
                  <p className="text-sm text-success" role="status">
                    {submissionMessage}
                  </p>
                ) : null}
                <p className="text-xs text-muted">
                  We keep your information confidential and never add you to marketing lists.
                </p>
              </form>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-inner">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Office hours</p>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>
                    <span className="font-medium text-foreground">{BUSINESS_HOURS.weekdays.label}</span>
                    <span className="ml-2">{BUSINESS_HOURS.weekdays.time}</span>
                  </li>
                  <li>
                    <span className="font-medium text-foreground">{BUSINESS_HOURS.saturday.label}</span>
                    <span className="ml-2">{BUSINESS_HOURS.saturday.time}</span>
                  </li>
                  <li>
                    <span className="font-medium text-foreground">{BUSINESS_HOURS.sunday.label}</span>
                    <span className="ml-2">{BUSINESS_HOURS.sunday.time}</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-inner">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Headquarters</p>
                <p className="mt-3 text-sm text-muted">
                  {CONTACT_INFO.address.line1}
                  <br />
                  {CONTACT_INFO.address.line2}
                  <br />
                  {CONTACT_INFO.address.line3}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl px-6 lg:mt-24" aria-labelledby="contact-metrics-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Signal backed assurance</p>
          <h2 id="contact-metrics-heading" className="font-heading text-3xl md:text-4xl">
            Metrics that show how Servitude Logic communicates and delivers
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Every conversation is anchored by measurable responsiveness, partner satisfaction, and delivery momentum.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {contactMetrics.map((metric, index) => (
            <article
              key={metric.id}
              className="rounded-3xl border border-border bg-surface/80 p-6 shadow-inner backdrop-blur"
              data-aos="fade-up"
              data-aos-delay={index * 120}
            >
              <div className="flex items-baseline gap-2">
                <span
                  ref={(node) => {
                    counterRefs.current[index] = node;
                    if (node) {
                      node.dataset.target = String(metric.value);
                    }
                  }}
                  className="text-4xl font-bold text-primary"
                >
                  0
                </span>
                <span className="text-2xl font-semibold text-primary">{metric.suffix}</span>
                <span className="sr-only">{`${metric.value}${metric.suffix}`}</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">{metric.label}</p>
              <p className="mt-2 text-sm text-muted">{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="contact-channels-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Connect directly</p>
          <h2 id="contact-channels-heading" className="font-heading text-3xl md:text-4xl">
            Choose the channel that fits your collaboration style
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Whether you prefer async context, scheduled reviews, or immediate alignment, our team is ready to meet you there.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {channelSprings.map((style, index) => {
            const channel = contactChannels[index];
            const Icon = channel.icon;
            return (
              <AnimatedChannelCard
                key={channel.id}
                style={style}
                href={channel.href}
                target={channel.id === "hq" ? "_blank" : undefined}
                rel={channel.id === "hq" ? "noreferrer" : undefined}
                className="block flex flex-col gap-4 rounded-3xl border border-border bg-surface/80 p-6 text-left shadow-lifted no-underline transition hover:border-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold text-foreground">{channel.label}</h3>
                <p className="text-base text-muted">{channel.description}</p>
                <p className="text-base font-semibold text-primary">{channel.value}</p>
              </AnimatedChannelCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="contact-rituals-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Engagement kickoff</p>
          <h2 id="contact-rituals-heading" className="font-heading text-3xl md:text-4xl">
            What happens after you click submit
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            We orchestrate fast alignment to ensure pods embed smoothly and signals are captured from day zero.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ritualSprings.map((style, index) => {
            const ritual = contactRituals[index];
            const Icon = ritual.icon;
            return (
              <AnimatedRitualCard
                key={ritual.id}
                style={style}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-surface/80 p-6 shadow-lifted"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold text-foreground">{ritual.title}</h3>
                <p className="text-base text-muted">{ritual.detail}</p>
              </AnimatedRitualCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="contact-showcase-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Collaboration artifacts</p>
          <h2 id="contact-showcase-heading" className="font-heading text-3xl md:text-4xl">
            Preview the materials our partners receive during onboarding
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            These assets keep every stakeholder aligned, from product and growth to operations and leadership.
          </p>
        </div>
        <div ref={deckRef} className="reveal mt-12 overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-lifted" aria-live="off">
          <div className="slides">
            {contactShowcase.map((slide) => (
              <section key={slide.id} className="p-10 text-left">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{slide.title}</p>
                <h3 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">{slide.headline}</h3>
                <p className="mt-4 max-w-3xl text-lg text-muted">{slide.copy}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="contact-faq-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">FAQs</p>
          <h2 id="contact-faq-heading" className="font-heading text-3xl md:text-4xl">
            Answers to common partnership questions
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Have more questions? Mention them in your note and we will cover them during our first call.
          </p>
        </div>
        <div className="mt-12 space-y-6">
          {contactFaqs.map((faq, index) => (
            <details
              key={faq.id}
              className="group rounded-3xl border border-border bg-surface/80 p-6 shadow-inner"
              data-aos="fade-up"
              data-aos-delay={index * 80}
            >
              <summary className="cursor-pointer text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                {faq.question}
              </summary>
              <p className="mt-3 text-base text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="mx-auto mt-24 w-full max-w-6xl px-6 pb-20 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} {appInfo.name}. Ready when you are.</p>
      </footer>
    </main>
  );
}
