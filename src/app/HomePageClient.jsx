// src/app/HomePageClient.jsx
"use client";
/**
 * @module app/HomePageClient
 */
import "aos/dist/aos.css";
import "reveal.js/dist/reveal.css";
import AOS from "aos";
import { animate, stagger } from "animejs";
import Reveal from "reveal.js";
import { animated, useSprings } from "@react-spring/web";
import { useEffect, useMemo, useRef } from "react";
import HeroSectionComponent from "@/components/ui/landingPage/HeroSectionComponent";
import Button from "@/components/ui/shadcn/Button";
import {
  craftPillars,
  heroContent,
  immersionSlides,
  kineticStats,
  processWaypoints,
  testimonials,
} from "@/data/page/home/homeData";

const AnimatedCard = animated.div;

/**
 * useCounterRefs
 * Provides a ref collection that is animated with Anime.js for stat counters.
 *
 * @param {number} count - Number of counters rendered.
 * @returns {React.MutableRefObject<HTMLElement[]>} Ref array.
 */
function useCounterRefs(count) {
  const refs = useRef([]);

  useEffect(() => {
    if (!refs.current.length) {
      return undefined;
    }
    const nodes = refs.current.slice(0, count).filter(Boolean);
    const animation = animate(nodes, {
      innerHTML: (_, index) => [0, Number(nodes[index]?.dataset?.target ?? 0)],
      easing: "easeOutExpo",
      duration: 1800,
      round: 1,
      delay: stagger(140),
    });
    return () => animation.pause();
  }, [count]);

  return refs;
}

/**
 * CaseStudyCarousel
 * Lightweight Reveal.js carousel for immersive project highlights.
 *
 * @param {Object} props - Component props.
 * @param {Array} props.slides - Slide descriptors.
 * @returns {JSX.Element}
 */
function CaseStudyCarousel({ slides }) {
  const deckRef = useRef(null);

  useEffect(() => {
    if (!deckRef.current) {
      return undefined;
    }
    const deck = new Reveal(deckRef.current, {
      embedded: true,
      controls: false,
      progress: false,
      slideNumber: false,
      autoPlayMedia: true,
      loop: true,
      transition: "fade",
      transitionSpeed: "slow",
    });
    deck.initialize();
    return () => deck.destroy();
  }, [slides.length]);

  return (
    <div
      ref={deckRef}
      className="reveal overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-lifted"
    >
      <div className="slides">
        {slides.map((slide) => (
          <section key={slide.id} className="p-10 text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">{slide.title}</p>
            <h3 className="mt-4 font-heading text-2xl text-foreground md:text-3xl">
              {slide.headline}
            </h3>
            <p className="mt-4 max-w-2xl text-lg text-muted">{slide.copy}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * HomePageClient
 * Reimagined Servitude Logic landing experience using Tailwind UI primitives,
 * Shadcn buttons, and layered animation libraries.
 *
 * @param {Object} props - Component props.
 * @param {JSX.Element|null} props.navigation - Server-rendered navigation element.
 * @returns {JSX.Element}
 */
export default function HomePageClient({ navigation }) {
  const counterRefs = useCounterRefs(kineticStats.length);
  const [pillarSprings, pillarApi] = useSprings(craftPillars.length, () => ({
    opacity: 0,
    y: 32,
  }));
  const revealSlides = useMemo(() => immersionSlides, []);

  useEffect(() => {
    AOS.init({ duration: 900, easing: "ease-out-quart", once: true });
  }, []);

  useEffect(() => {
    pillarApi.start((index) => ({
      opacity: 1,
      y: 0,
      delay: 420 + index * 90,
      config: { tension: 220, friction: 26 },
    }));
  }, [pillarApi]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-[1] bg-glow-iris" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[2] bg-glow-lagoon opacity-80" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col">
        <div aria-label="Public navigation" className="sticky top-0 z-20 bg-background/80 backdrop-blur">
          {navigation}
        </div>

        <HeroSectionComponent
          onPrimaryClick={() => {
            window.location.href = heroContent.primaryCta.href;
          }}
          onSecondaryClick={() => {
            const target = document.getElementById("capabilities");
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        <section
          className="mx-6 mb-16 rounded-3xl border border-border bg-surface/80 p-10 shadow-lifted lg:mx-12"
          aria-labelledby="stats-heading"
        >
          <div className="flex flex-col gap-4" data-aos="fade-up">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Proven impact metrics
            </span>
            <h2 id="stats-heading" className="font-heading text-3xl md:text-4xl">
              Outcomes Servitude Logic delivers on every engagement
            </h2>
            <p className="max-w-3xl text-lg text-muted">
              From week-one momentum to post-launch durability, clients rely on these signals to benchmark the progress of every initiative we shepherd.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {kineticStats.map((stat, index) => (
              <div
                key={stat.id}
                className="rounded-2xl border border-border bg-background/60 p-6 shadow-inner"
              >
                <div className="flex items-baseline gap-2">
                  <span
                    ref={(node) => {
                      if (node) {
                        counterRefs.current[index] = node;
                        node.dataset.target = String(stat.value);
                      }
                    }}
                    className="text-4xl font-bold text-primary"
                  >
                    0
                  </span>
                  <span className="text-2xl font-semibold text-primary">
                    {stat.suffix}
                  </span>
                  <span className="sr-only">{`${stat.value}${stat.suffix}`}</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-foreground">{stat.label}</p>
                <p className="mt-2 text-sm text-muted">{stat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" className="mx-6 mb-20 lg:mx-12" aria-labelledby="pillars-heading">
          <div className="flex flex-col gap-4" data-aos="fade-up">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Full-stack craftsmanship
            </span>
            <h2 id="pillars-heading" className="font-heading text-3xl md:text-4xl">
              Orchestrating the entire product journey
            </h2>
            <p className="max-w-3xl text-lg text-muted">
              Servitude Logic embeds specialists across strategy, design, engineering, and operations so every touchpoint feels purposeful and performant.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pillarSprings.map((styles, index) => {
              const pillar = craftPillars[index];
              const Icon = pillar.icon;
              return (
                <AnimatedCard
                  key={pillar.id}
                  style={{ opacity: styles.opacity, transform: styles.y.to((value) => `translateY(${value}px)`) }}
                  className="group rounded-2xl border border-border bg-surface/80 p-6 shadow-lg transition hover:border-primary/60 hover:shadow-lifted"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon aria-hidden="true" size={24} />
                  </div>
                  <h3 className="mt-6 font-heading text-xl">{pillar.title}</h3>
                  <p className="mt-3 text-sm text-muted">{pillar.copy}</p>
                </AnimatedCard>
              );
            })}
          </div>
        </section>

        <section className="mx-6 mb-20 lg:mx-12" aria-labelledby="showcase-heading">
          <div className="flex flex-col gap-4" data-aos="fade-up">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Immersive launches
            </span>
            <h2 id="showcase-heading" className="font-heading text-3xl md:text-4xl">
              Case studies we can&apos;t stop thinking about
            </h2>
            <p className="max-w-3xl text-lg text-muted">
              Explore how Servitude Logic ignites enterprise-grade experiences without sacrificing momentum.
            </p>
          </div>
          <div className="mt-10" data-aos="fade-up" data-aos-delay="120">
            <CaseStudyCarousel slides={revealSlides} />
          </div>
        </section>

        <section className="mx-6 mb-20 rounded-3xl border border-border bg-surface/80 p-10 shadow-lg lg:mx-12" aria-labelledby="process-heading">
          <div className="flex flex-col gap-4" data-aos="fade-up">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Delivery blueprint
            </span>
            <h2 id="process-heading" className="font-heading text-3xl md:text-4xl">
              How Servitude Logic turns shared ideas into living products
            </h2>
            <p className="max-w-3xl text-lg text-muted">
              Every engagement follows a transparent rhythm that blends high-trust collaboration with measurable progress.
            </p>
          </div>
          <ol className="mt-10 space-y-6">
            {processWaypoints.map((step, index) => (
              <li
                key={step.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-background/70 p-6 md:flex-row md:items-start"
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col">
                  <h3 className="font-heading text-xl text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-6 mb-24 lg:mx-12" aria-labelledby="testimonials-heading">
          <div className="flex flex-col gap-4" data-aos="fade-up">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Resonating with leadership teams
            </span>
            <h2 id="testimonials-heading" className="font-heading text-3xl md:text-4xl">
              Clients describe partnering with Servitude Logic
            </h2>
            <p className="max-w-3xl text-lg text-muted">
              The words that matter most come from the founders, operators, and investors we serve.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3" data-aos="fade-up" data-aos-delay="120">
            {testimonials.map((quote) => (
              <blockquote
                key={quote.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface/80 p-6 shadow-inner"
              >
                <p className="text-lg text-foreground">&ldquo;{quote.quote}&rdquo;</p>
                <footer className="mt-6 text-sm text-muted">
                  <span className="font-semibold text-foreground">{quote.author}</span>
                  <br />
                  <span>{quote.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="mx-6 mb-24 rounded-3xl border border-primary bg-gradient-to-br from-primary/20 via-primary/5 to-background p-10 text-center shadow-lifted lg:mx-12" aria-labelledby="cta-heading">
          <div className="mx-auto flex max-w-3xl flex-col gap-6" data-aos="fade-up">
            <h2 id="cta-heading" className="font-heading text-3xl md:text-4xl">
              Ready to orchestrate your next product with Servitude Logic?
            </h2>
            <p className="text-lg text-muted">
              Let&apos;s align your roadmap, ignite your release cadence, and deliver results your stakeholders can feel.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={() => (window.location.href = heroContent.primaryCta.href)}>
                Start the conversation
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => (window.location.href = heroContent.secondaryCta.href)}
              >
                Explore our playbooks
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
