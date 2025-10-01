// src/app/workflow/WorkflowPageClient.jsx
"use client";
/**
 * @module app/workflow/WorkflowPageClient
 */
import "aos/dist/aos.css";
import "reveal.js/dist/reveal.css";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef } from "react";
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
import workflowData from "@/data/page/workflow/workflowData";
import heroOrb from "@/data/animations/heroOrb.json";
import {
  workflowParticleOptions,
  workflowAosConfig,
  workflowTimelineDefaults,
  workflowTimelineSteps,
  workflowCounterAnimation,
  workflowSpringConfig,
  workflowRevealConfig,
  workflowLottieOptions,
} from "@/data/page/workflow/workflowAnimationConfig";

const Particles = dynamic(async () => {
  const mod = await import("@tsparticles/react");
  return mod.Particles;
}, { ssr: false });

const AnimatedRitualCard = animated.div;

/**
 * useParticleInit
 * Provides a memoized initializer for tsparticles slim bundle.
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
 * Memoizes particle configuration.
 *
 * @returns {Object} Particle options.
 */
function useParticleOptions() {
  return useMemo(() => workflowParticleOptions, []);
}

/**
 * useGsapHero
 * Mounts a GSAP timeline for hero animations.
 *
 * @param {React.RefObject<HTMLElement>} scopeRef - Reference to the hero wrapper.
 */
function useGsapHero(scopeRef) {
  useEffect(() => {
    if (!scopeRef.current) {
      return undefined;
    }
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: workflowTimelineDefaults });
      workflowTimelineSteps.forEach(({ selector, vars, position }) => {
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
 * Generates mutable refs for counter nodes.
 *
 * @param {number} count - Number of counters needed.
 * @returns {React.MutableRefObject<Array<HTMLElement|null>>} Counter references.
 */
function useCounterRefs(count) {
  const refs = useRef(new Array(count).fill(null));
  return refs;
}

/**
 * useAnimateCounters
 * Triggers Anime.js counters on mount.
 *
 * @param {React.MutableRefObject<Array<HTMLElement|null>>} counterRefs - Counter node references.
 * @param {number} total - Counter count.
 */
function useAnimateCounters(counterRefs, total) {
  useEffect(() => {
    const nodes = counterRefs.current.slice(0, total).filter(Boolean);
    if (!nodes.length) {
      return undefined;
    }
    const animation = animate(nodes, {
      ...workflowCounterAnimation,
      innerHTML: (_, index) => [0, Number(nodes[index]?.dataset?.target ?? 0)],
    });
    return () => animation?.pause();
  }, [counterRefs, total]);
}

/**
 * useRitualSprings
 * Creates spring animations for ritual cards.
 *
 * @param {number} count - Number of cards.
 * @returns {Array} Spring values for each card.
 */
function useRitualSprings(count) {
  const [springs, api] = useSprings(count, () => ({
    opacity: 0,
    y: 28,
    scale: 0.94,
  }));

  useEffect(() => {
    api.start((index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      delay: 320 + index * 120,
      config: workflowSpringConfig,
    }));
  }, [api]);

  return springs;
}

/**
 * useRevealCarousel
 * Initializes Reveal.js carousel.
 *
 * @param {React.RefObject<HTMLDivElement>} deckRef - Reveal container ref.
 * @param {number} slideCount - Number of slides.
 */
function useRevealCarousel(deckRef, slideCount) {
  useEffect(() => {
    if (!deckRef.current) {
      return undefined;
    }
    const deck = new Reveal(deckRef.current, workflowRevealConfig);
    deck.initialize();
    return () => deck.destroy();
  }, [deckRef, slideCount]);
}

/**
 * useAosAnimation
 * Bootstraps AOS scroll animations.
 */
function useAosAnimation() {
  useEffect(() => {
    AOS.init(workflowAosConfig);
  }, []);
}

/**
 * WorkflowPageClient
 * Client-side experience for the workflow marketing route.
 *
 * @param {Object} props - Component props.
 * @param {JSX.Element|null} props.navigation - Server-rendered navigation element.
 * @param {string} [props.accentClassName] - Custom accent font class.
 * @param {string} [props.accentVariable] - Custom accent font variable.
 * @returns {JSX.Element}
 */
export default function WorkflowPageClient({ navigation, accentClassName = "", accentVariable = "" }) {
  const { workflowHero, workflowMetrics, workflowPhases, workflowRituals, workflowShowcase, workflowAccelerators } = workflowData;
  const heroRef = useRef(null);
  const deckRef = useRef(null);
  const counterRefs = useCounterRefs(workflowMetrics.length);
  const particleOptions = useParticleOptions();
  const handleParticlesInit = useParticleInit();
  const lottieOptions = useMemo(() => ({ ...workflowLottieOptions, animationData: heroOrb }), []);
  const springs = useRitualSprings(workflowRituals.length);
  const { resolvedTheme } = useTheme();

  useGsapHero(heroRef);
  useAosAnimation();
  useRevealCarousel(deckRef, workflowShowcase.length);
  useAnimateCounters(counterRefs, workflowMetrics.length);

  return (
    <main className={`${accentVariable} min-h-screen bg-background text-foreground`}>
      <div aria-label="Public navigation" className="sticky top-0 z-20 bg-background/80 backdrop-blur">
        {navigation}
      </div>
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.28),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(99,102,241,0.25),_transparent_65%)]"
      >
        <div className="absolute inset-0">
          <Particles id="workflow-particles" init={handleParticlesInit} options={particleOptions} />
          <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/45 to-background/90" aria-hidden="true" />
        </div>
        <div className="relative z-[1] mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:py-32">
          <div className="flex flex-col gap-6">
            <span
              data-workflow-eyebrow
              className="inline-flex max-w-max items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary"
            >
              <span aria-hidden="true">🪐</span>
              {workflowHero.eyebrow}
            </span>
            <h1
              data-workflow-heading
              className={`${accentClassName} text-4xl leading-tight md:text-5xl lg:text-6xl`}
              dangerouslySetInnerHTML={{ __html: workflowHero.heroTitle }}
            />
            <p data-workflow-subtitle className="max-w-2xl text-lg text-muted md:text-xl">
              {workflowHero.heroSubtitle}
            </p>
            <div data-workflow-actions className="flex flex-col gap-4 sm:flex-row" role="group" aria-label="Workflow calls to action">
              <Button
                type="button"
                onClick={() => {
                  window.location.href = workflowHero.primaryCta.href;
                }}
                className="w-full sm:w-auto"
              >
                {workflowHero.primaryCta.label}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  window.location.href = workflowHero.secondaryCta.href;
                }}
                className="w-full sm:w-auto"
              >
                {workflowHero.secondaryCta.label}
              </Button>
            </div>
            <p className="text-sm text-muted">
              Current theme mode:&nbsp;
              <span className="font-semibold text-foreground" aria-live="polite">
                {resolvedTheme ?? "light"}
              </span>
            </p>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="relative h-[320px] w-[320px] rounded-full bg-gradient-to-br from-primary/18 via-background/20 to-transparent p-8 shadow-lifted sm:h-[360px] sm:w-[360px]">
              <Lottie
                options={lottieOptions}
                height={260}
                width={260}
                isClickToPauseDisabled
                aria-label="Animated workflow illustration"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl px-6 lg:mt-24" aria-labelledby="workflow-metrics-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Momentum signals</p>
          <h2 id="workflow-metrics-heading" className="font-heading text-3xl md:text-4xl">
            Evidence that our workflow keeps teams in sync and shipping
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Transparent rituals and integrated telemetry deliver clarity faster than status meetings, so initiatives stay on course and stakeholders stay confident.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {workflowMetrics.map((metric, index) => (
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

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="workflow-rituals-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Rituals</p>
          <h2 id="workflow-rituals-heading" className="font-heading text-3xl md:text-4xl">
            The rituals that keep Servitude Logic pods accelerating outcomes
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Repeatable ceremonies, embedded enablement, and proactive resilience drills weave together to create momentum that clients feel every day.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {springs.map((style, index) => {
            const ritual = workflowRituals[index];
            const Icon = ritual.icon;
            return (
              <AnimatedRitualCard
                key={ritual.id}
                style={style}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-surface/80 p-8 shadow-lifted"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-semibold text-foreground">{ritual.title}</h3>
                <p className="text-base text-muted">{ritual.detail}</p>
              </AnimatedRitualCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="workflow-phases-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Delivery arc</p>
          <h2 id="workflow-phases-heading" className="font-heading text-3xl md:text-4xl">
            Three phases that keep discovery, delivery, and growth intertwined
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Each phase has distinct objectives, artifacts, and exit criteria so stakeholders understand progress and teams stay aligned on impact.
          </p>
        </div>
        <ol className="mt-12 space-y-8 border-l border-border pl-6 md:space-y-10" data-aos="fade-up">
          {workflowPhases.map((phase, index) => (
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

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="workflow-showcase-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Workflow assets</p>
          <h2 id="workflow-showcase-heading" className="font-heading text-3xl md:text-4xl">
            Visualize the operating system we plug into your teams
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Explore the dashboards, playbooks, and growth loops that accompany every engagement, keeping leaders tapped into progress and impact.
          </p>
        </div>
        <div ref={deckRef} className="reveal mt-12 overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-lifted" aria-live="off">
          <div className="slides">
            {workflowShowcase.map((slide) => (
              <section key={slide.id} className="p-10 text-left">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{slide.title}</p>
                <h3 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">{slide.headline}</h3>
                <p className="mt-4 max-w-3xl text-lg text-muted">{slide.copy}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="workflow-accelerators-heading">
        <div className="flex flex-col gap-4" data-aos="fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Accelerators</p>
          <h2 id="workflow-accelerators-heading" className="font-heading text-3xl md:text-4xl">
            Fortify the workflow with specialized accelerators
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Layer on fractional product operations, platform modernization, or AI copilots to extend the Servitude Logic playbook across your organization.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {workflowAccelerators.map((accelerator, index) => (
            <article
              key={accelerator.id}
              className="rounded-3xl border border-border bg-surface/80 p-6 shadow-inner"
              data-aos="zoom-in"
              data-aos-delay={index * 120}
            >
              <h3 className="text-xl font-semibold text-foreground">{accelerator.title}</h3>
              <p className="mt-2 text-base text-muted">{accelerator.description}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary/12 via-background/60 to-background/85 p-10 text-center shadow-lifted" data-aos="fade-up">
          <h3 className="text-2xl font-semibold text-foreground">
            Spin up a Servitude Logic workflow inside your organisation
          </h3>
          <p className="mx-auto max-w-2xl text-base text-muted">
            Share your delivery goals and we will co-design the first two sprints, complete with rituals, dashboards, and enablement assets tailored to your teams.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                window.location.href = workflowHero.primaryCta.href;
              }}
            >
              {workflowHero.primaryCta.label}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.href = "/contact";
              }}
            >
              Talk with an architect
            </Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-24 w-full max-w-6xl px-6 pb-20 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} {appInfo.name}. Powered by relentless curiosity.</p>
      </footer>
    </main>
  );
}
