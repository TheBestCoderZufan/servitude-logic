// src/components/ui/landingPage/HeroSectionComponent.jsx
"use client";
/**
 * @module components/ui/landingPage/HeroSectionComponent
 */
import dynamic from "next/dynamic";
import gsap from "gsap";
import Lottie from "react-lottie";
import { loadSlim } from "@tsparticles/slim";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { heroContent } from "@/data/page/home/homeData";
import Button from "@/components/ui/shadcn/Button";
import heroOrb from "@/data/animations/heroOrb.json";

const Particles = dynamic(async () => {
  const mod = await import("@tsparticles/react");
  return mod.Particles;
}, { ssr: false });

/**
 * useParticleOptions
 * Memoizes the particle configuration used for the hero background.
 *
 * @returns {object} Particle options.
 */
function useParticleOptions() {
  return useMemo(
    () => ({
      background: { color: "transparent" },
      fpsLimit: 60,
      particles: {
        number: { value: 45, density: { enable: true, area: 800 } },
        color: { value: ["#38bdf8", "#a855f7", "#0ea5e9"] },
        opacity: {
          value: 0.45,
          anim: { enable: true, speed: 0.6, opacity_min: 0.1, sync: false },
        },
        size: {
          value: { min: 1, max: 3 },
          anim: { enable: true, speed: 3, size_min: 0.3, sync: false },
        },
        move: {
          enable: true,
          speed: 1.4,
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "out" },
        },
        links: {
          enable: true,
          distance: 140,
          color: "#38bdf8",
          opacity: 0.25,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          resize: true,
        },
        modes: {
          repulse: { distance: 120, duration: 0.4 },
        },
      },
      detectRetina: true,
    }),
    [],
  );
}

/**
 * HeroSectionComponent
 * High-impact hero with animated copy, Lottie illustration, and particles.
 *
 * @param {Object} props - Component props.
 * @param {Object} [props.content] - Optional hero content override.
 * @param {Function} [props.onPrimaryClick] - Optional callback for the primary CTA.
 * @param {Function} [props.onSecondaryClick] - Optional callback for the secondary CTA.
 * @returns {JSX.Element}
 */
export default function HeroSectionComponent({ content = heroContent, onPrimaryClick, onSecondaryClick }) {
  const heroCopy = content || heroContent;
  const {
    eyebrow,
    heroTitle,
    heroSubtitle,
    primaryCta = {},
    secondaryCta = {},
  } = heroCopy || {};
  const primaryLabel = primaryCta?.label ?? "Get Started";
  const secondaryLabel = secondaryCta?.label ?? "Learn More";
  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const lottieOptions = useMemo(
    () => ({
      loop: true,
      autoplay: true,
      animationData: heroOrb,
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    }),
    [],
  );
  const particleOptions = useParticleOptions();

  const handleParticlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    if (!heroRef.current) {
      return undefined;
    }
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .from("[data-hero-eyebrow]", { y: 24, opacity: 0, duration: 0.6 })
        .from(headingRef.current, { y: 40, opacity: 0, duration: 0.8 }, "-=0.3")
        .from("[data-hero-subtitle]", { y: 32, opacity: 0, duration: 0.8 }, "-=0.4")
        .from("[data-hero-actions]", { y: 24, opacity: 0, duration: 0.5 }, "-=0.3");
    }, heroRef);
    return () => context.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.35),_transparent_60%)]"
    >
      <div className="absolute inset-0">
        <Particles id="hero-particles" init={handleParticlesInit} options={particleOptions} />
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-background/90 backdrop-blur-sm" />
      </div>
      <div className="relative z-[1] mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:gap-16 lg:py-32">
        <div className="flex flex-1 flex-col gap-6 text-foreground">
          <span
            data-hero-eyebrow
            className="inline-flex max-w-max items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold uppercase tracking-wide text-primary"
          >
            <span aria-hidden="true">✨</span>
            {eyebrow}
          </span>
          <h1 ref={headingRef} className="font-heading text-4xl leading-tight md:text-5xl lg:text-6xl">
            <span dangerouslySetInnerHTML={{ __html: heroTitle }} />
          </h1>
          <p data-hero-subtitle className="max-w-2xl text-lg text-muted md:text-xl">
            {heroSubtitle}
          </p>
          <div data-hero-actions className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={onPrimaryClick} className="w-full sm:w-auto">
              {primaryLabel}
            </Button>
            <Button
              variant="secondary"
              onClick={onSecondaryClick}
              className="w-full sm:w-auto"
            >
              {secondaryLabel}
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="relative h-[320px] w-[320px] rounded-full bg-gradient-to-br from-primary/20 via-accent-soft to-transparent p-8 shadow-lifted sm:h-[380px] sm:w-[380px]">
            <Lottie
              options={lottieOptions}
              height={280}
              width={280}
              isClickToPauseDisabled
              aria-label="Animated brand orb"
            />
          </div>
        </div>
      </div>
    </section>
  );
}