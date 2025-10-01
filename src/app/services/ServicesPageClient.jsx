// src/app/services/ServicesPageClient.jsx
"use client";
/**
 * @module app/services/ServicesPageClient
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
import { animated, useSprings } from "react-spring";
import Lottie from "react-lottie";
import { loadSlim } from "@tsparticles/slim";
import Button from "@/components/ui/shadcn/Button";
import appInfo from "@/data/appInfo";
import servicesData from "@/data/page/services/servicesData";
import {
  servicesParticleOptions,
  servicesAosConfig,
  servicesTimelineDefaults,
  servicesTimelineSteps,
  servicesCounterAnimation,
  servicesSpringConfig,
  servicesRevealConfig,
  servicesLottieOptions,
} from "@/data/page/services/servicesAnimationConfig";
import heroOrb from "@/data/animations/heroOrb.json";

const Particles = dynamic(async () => {
  const mod = await import("@tsparticles/react");
  return mod.Particles;
}, { ssr: false });

const AnimatedServiceCard = animated.div;
const AnimatedPackageCard = animated.div;

/**
 * useParticleOptions
 * Memoizes the particle options for the hero background.
 *
 * @returns {Object} Particle engine options.
 */
function useParticleOptions() {
  return useMemo(() => servicesParticleOptions, []);
}

/**
 * useParticleInit
 * Provides a memoized initializer that loads the slim bundle of tsparticles.
 *
 * @returns {Function} Initialization callback for the particle engine.
 */
function useParticleInit() {
  const init = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);
  return init;
}

/**
 * useGsapHero
 * Sets up the GSAP hero entrance timeline.
 *
 * @param {React.RefObject<HTMLElement>} scopeRef - Root element reference.
 */
function useGsapHero(scopeRef) {
  useEffect(() => {
    if (!scopeRef.current) {
      return undefined;
    }
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: servicesTimelineDefaults });
      servicesTimelineSteps.forEach(({ selector, vars, position }) => {
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
 * Manages numeric counter refs for Anime.js animations.
 *
 * @param {number} count - Number of counters to support.
 * @returns {React.MutableRefObject<Array<HTMLElement|null>>} Mutable ref array.
 */
function useCounterRefs(count) {
  const refs = useRef(new Array(count).fill(null));
  return refs;
}

/**
 * useAnimateCounters
 * Triggers Anime.js driven number animations on mount.
 *
 * @param {React.MutableRefObject<Array<HTMLElement|null>>} counterRefs - Counter nodes.
 * @param {number} total - Number of counters.
 */
function useAnimateCounters(counterRefs, total) {
  useEffect(() => {
    const nodes = counterRefs.current.slice(0, total).filter(Boolean);
    if (!nodes.length) {
      return undefined;
    }
    const animation = animate(nodes, {
      ...servicesCounterAnimation,
      innerHTML: (_, index) => [0, Number(nodes[index]?.dataset?.target ?? 0)],
    });
    return () => animation?.pause();
  }, [counterRefs, total]);
}

/**
 * useCatalogSprings
 * Generates animated springs for service catalogue cards.
 *
 * @param {number} count - Total number of cards.
 * @returns {Array} Animated spring values for each card.
 */
function useCatalogSprings(count) {
  const [springs, api] = useSprings(count, () => ({ opacity: 0, y: 32, scale: 0.96 }));

  useEffect(() => {
    api.start((index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      delay: 320 + index * 120,
      config: servicesSpringConfig,
    }));
  }, [api]);

  return springs;
}

/**
 * usePackageSprings
 * Creates animation springs for service package cards.
 *
 * @param {number} count - Number of package cards.
 * @returns {Array} Animated spring values for each package card.
 */
function usePackageSprings(count) {
  const [springs, api] = useSprings(count, () => ({ opacity: 0, y: 28, scale: 0.95 }));

  useEffect(() => {
    api.start((index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      delay: 300 + index * 140,
      config: servicesSpringConfig,
    }));
  }, [api]);

  return springs;
}

/**
 * useRevealCarousel
 * Initializes the Reveal.js carousel for service stories.
 *
 * @param {React.RefObject<HTMLDivElement>} deckRef - Reveal container ref.
 * @param {number} slideCount - Carousel slide count.
 */
function useRevealCarousel(deckRef, slideCount) {
  useEffect(() => {
    if (!deckRef.current) {
      return undefined;
    }
    const deck = new Reveal(deckRef.current, servicesRevealConfig);
    deck.initialize();
    return () => deck.destroy();
  }, [deckRef, slideCount]);
}

/**
 * useAosAnimation
 * Boots AOS (Animate on Scroll) once on mount.
 */
function useAosAnimation(dependencies) {
  useEffect(() => {
    AOS.init(servicesAosConfig);
    return () => {
      AOS.refreshHard();
    };
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, dependencies);
}

/**
 * ServicesPageClient
 * Service catalogue highlighting how Servitude Logic partners with product teams.
 *
 * @param {Object} props - Component props.
 * @param {JSX.Element|null} props.navigation - Server-rendered public navigation content.
 * @param {string} [props.accentClassName] - Next font class name for highlighted headings.
 * @param {string} [props.accentVariable] - CSS variable class for the accent font.
 * @returns {JSX.Element}
 */
export default function ServicesPageClient({ navigation, accentClassName = "", accentVariable = "" }) {
  const {
    servicesHero,
    serviceCatalog,
    servicePackages,
    statHighlights,
    integrationShowcase,
    journeyPhases,
    acceleratorModules,
    serviceDifferentiators,
  } = servicesData;

  const heroRef = useRef(null);
  const deckRef = useRef(null);
  const counterRefs = useCounterRefs(statHighlights.length);
  const particleOptions = useParticleOptions();
  const handleParticlesInit = useParticleInit();
  const lottieOptions = useMemo(() => ({ ...servicesLottieOptions, animationData: heroOrb }), []);
  const catalogSprings = useCatalogSprings(serviceCatalog.length);
  const packageSprings = usePackageSprings(servicePackages.length);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGsapHero(heroRef);
  useAosAnimation([
    serviceCatalog.length,
    servicePackages.length,
    serviceDifferentiators.length,
    integrationShowcase.length,
    acceleratorModules.length,
  ]);
  useRevealCarousel(deckRef, integrationShowcase.length);
  useAnimateCounters(counterRefs, statHighlights.length);

  return (
    <main className={`${accentVariable} min-h-screen bg-background text-foreground`}>
      <div aria-label="Public navigation" className="sticky top-0 z-20 bg-background/80 backdrop-blur">
        {navigation}
      </div>

      <section
        ref={heroRef}
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_58%),radial-gradient(circle_at_bottom,_rgba(99,102,241,0.26),_transparent_64%)]"
      >
        <div className="absolute inset-0">
          <Particles id="services-particles" init={handleParticlesInit} options={particleOptions} />
          <div className="absolute inset-0 bg-gradient-to-br from-background/74 via-background/42 to-background/90" aria-hidden="true" />
        </div>
        <div className="relative z-[1] mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16 lg:py-28">
          <div className="flex flex-col gap-6">
            <span
              data-services-eyebrow
              className="inline-flex max-w-max items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary"
            >
              <span aria-hidden="true">🧭</span>
              {servicesHero.eyebrow}
            </span>
            <h1
              data-services-heading
              className={`${accentClassName} text-4xl leading-tight md:text-5xl lg:text-6xl`}
              dangerouslySetInnerHTML={{ __html: servicesHero.heroTitle }}
            />
            <p data-services-subtitle className="max-w-2xl text-lg text-muted md:text-xl">
              {servicesHero.heroSubtitle}
            </p>
            <div
              className="grid gap-4 sm:grid-cols-2"
              data-services-insight
              data-aos="fade-up"
            >
              <article className="rounded-2xl border border-border bg-surface/90 p-5 shadow-inner">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Outcome aligned</p>
                <p className="mt-3 text-sm text-muted">
                  Pods are staffed with senior strategists, designers, engineers, and growth operators focused on the KPIs you share with leadership.
                </p>
              </article>
              <article className="rounded-2xl border border-border bg-surface/90 p-5 shadow-inner">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Enablement ready</p>
                <p className="mt-3 text-sm text-muted">
                  Deliverables ship with playbooks, dashboards, and training assets so your teams stay empowered after go-live.
                </p>
              </article>
            </div>
            <div data-services-actions className="mt-4 flex flex-col gap-4 sm:flex-row" role="group" aria-label="Primary service calls to action">
              <Button type="button" className="w-full sm:w-auto" onClick={() => { window.location.href = servicesHero.primaryCta.href; }}>
                {servicesHero.primaryCta.label}
              </Button>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => { window.location.href = servicesHero.secondaryCta.href; }}>
                {servicesHero.secondaryCta.label}
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
                  <Lottie options={lottieOptions} height={48} width={48} isClickToPauseDisabled aria-label="Animated services illustration" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">Engagement snapshot</p>
                  <p className="text-sm text-muted">Every partnership starts with immersion, telemetry, and roadmap alignment so delivery never happens in isolation.</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-muted">
                <li>Specialist pods embedded alongside your team within 10 business days.</li>
                <li>Delivery operations, QA automation, and observability included by default.</li>
                <li>Quarterly outcome reviews ensure the roadmap adapts as your strategy evolves.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl px-6 lg:mt-24" aria-labelledby="stat-highlight-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Proof points</p>
          <h2 id="stat-highlight-heading" className="font-heading text-3xl md:text-4xl">
            Results our clients rely on to measure success
          </h2>
          <p className="max-w-2xl text-lg text-muted">
            Engagements are measured through shared dashboards so you see the same activation, retention, and reliability improvements we do.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {statHighlights.map((stat, index) => (
            <article
              key={stat.id}
              className="rounded-3xl border border-border bg-surface/80 p-6 shadow-inner backdrop-blur"
              data-aos="fade-up"
              data-aos-delay={index * 120}
            >
              <div className="flex items-baseline gap-2">
                <span
                  ref={(node) => {
                    counterRefs.current[index] = node;
                    if (node) {
                      node.dataset.target = String(stat.value);
                    }
                  }}
                  className="text-4xl font-bold text-primary"
                >
                  0
                </span>
                <span className="text-2xl font-semibold text-primary">{stat.suffix}</span>
                <span className="sr-only">{`${stat.value}${stat.suffix}`}</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">{stat.label}</p>
              <p className="mt-2 text-sm text-muted">{stat.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="service-catalog-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Service catalogue</p>
          <h2 id="service-catalog-heading" className="font-heading text-3xl md:text-4xl">
            Capabilities covering every stage of your software lifecycle
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Engage a single stream or combine multiple to create a bespoke programme focused on strategic outcomes.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {catalogSprings.map((style, index) => {
            const category = serviceCatalog[index];
            const Icon = category.icon;
            return (
              <AnimatedServiceCard
                key={category.id}
                style={style}
                className="flex flex-col gap-5 rounded-3xl border border-border bg-surface/80 p-8 shadow-lifted"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: category.label }} />
                    <p className="text-sm text-muted">{category.blurb}</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {category.offerings.map((offering) => (
                    <li key={offering.id} className="rounded-2xl border border-border bg-background/60 p-4 shadow-inner">
                      <p className="text-base font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: offering.title }} />
                      <p className="mt-2 text-sm text-muted">{offering.description}</p>
                    </li>
                  ))}
                </ul>
              </AnimatedServiceCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="service-packages-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Engagement models</p>
          <h2 id="service-packages-heading" className="font-heading text-3xl md:text-4xl">
            Packages shaped around the stage and scale of your product
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Start lean with a focused pod or mobilise a multi-stream programme—each package is customisable with the catalogue and accelerator modules.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {packageSprings.map((style, index) => {
            const pack = servicePackages[index];
            const Icon = pack.icon;
            return (
              <AnimatedPackageCard
                key={pack.id}
                style={style}
                className="flex flex-col gap-5 rounded-3xl border border-border bg-surface/80 p-6 shadow-lifted"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{pack.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-muted">{pack.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-muted">{pack.summary}</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ideal for</p>
                  <p className="text-sm text-muted">{pack.idealFor}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">What&apos;s included</p>
                  <ul className="mt-2 space-y-2 text-sm text-muted">
                    {pack.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span aria-hidden="true">•</span>
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedPackageCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="differentiators-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Why product leaders choose us</p>
          <h2 id="differentiators-heading" className="font-heading text-3xl md:text-4xl">
            Delivery partners who obsess over outcomes and enablement
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Servitude Logic plugs into your organisation with transparency, shared accountability, and enterprise-grade engineering craft.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {serviceDifferentiators.map((diff) => {
            const Icon = diff.icon;
            return (
              <article key={diff.id} className="rounded-3xl border border-border bg-surface/80 p-6 shadow-inner" data-aos="fade-up">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{diff.title}</h3>
                <p className="mt-2 text-base text-muted">{diff.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="journey-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Engagement flow</p>
          <h2 id="journey-heading" className="font-heading text-3xl md:text-4xl">
            A delivery arc designed to sustain long-term outcomes
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            We align strategy, delivery, and enablement across a three-phase journey that keeps outcomes compounding.
          </p>
        </div>
        <ol className="mt-12 space-y-8 border-l border-border pl-6 md:space-y-10" data-aos="fade-up">
          {journeyPhases.map((phase, index) => (
            <li key={phase.id} className="relative pl-6">
              <div className="absolute left-[-1.45rem] top-1 flex h-8 w-8 items-center justify-center rounded-full border border-primary bg-background text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-foreground">{phase.title}</h3>
              <p className="mt-2 text-base text-muted">{phase.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="integration-showcase-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Selected transformations</p>
          <h2 id="integration-showcase-heading" className="font-heading text-3xl md:text-4xl">
            Explore how we activate the catalogue inside modern organisations
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Journey through a rotating gallery that highlights the breadth of capabilities our pods activate inside modern organisations.
          </p>
        </div>
        <div ref={deckRef} className="reveal mt-12 overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-lifted" aria-live="off">
          <div className="slides">
            {integrationShowcase.map((slide) => (
              <section key={slide.id} className="p-10 text-left">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{slide.title}</p>
                <h3 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">{slide.headline}</h3>
                <p className="mt-4 max-w-3xl text-lg text-muted">{slide.copy}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="accelerator-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Acceleration modules</p>
          <h2 id="accelerator-heading" className="font-heading text-3xl md:text-4xl">
            Optional add-ons that amplify delivery momentum
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Select specialised accelerators to layer on top of the core team and unlock dedicated expertise for compliance, AI enablement, and growth.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {acceleratorModules.map((module) => (
            <article key={module.id} className="rounded-3xl border border-border bg-surface/80 p-6 shadow-inner" data-aos="zoom-in">
              <h3 className="text-xl font-semibold text-foreground">{module.title}</h3>
              <p className="mt-2 text-base text-muted">{module.detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary/12 via-background/60 to-background/85 p-10 text-center shadow-lifted" data-aos="fade-up">
          <h3 className="text-2xl font-semibold text-foreground">
            Ready to assemble the Servitude Logic team your roadmap needs?
          </h3>
          <p className="mx-auto max-w-2xl text-base text-muted">
            Share your priority initiatives and we will craft a custom engagement plan mapped to outcomes, cadence, and success metrics within 48 hours.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                window.location.href = servicesHero.primaryCta.href;
              }}
            >
              {servicesHero.primaryCta.label}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.href = "/workflow";
              }}
            >
              Review delivery workflow
            </Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-24 w-full max-w-6xl px-6 pb-20 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} {appInfo.name}. Crafted by Servitude Logic.</p>
      </footer>
    </main>
  );
}
