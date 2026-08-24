"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

// "Reveal ... count-up on a stat entering view" — the brief's own motion
// rule, and the only stat type that gets one: a nameable, single-purpose
// animation, not a generic number tween applied everywhere.
function useCountUp(target: number, durationMs = 900) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }
    let raf: number;
    let start: number | null = null;
    function step(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      setValue(target * progress);
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target, durationMs, prefersReducedMotion]);

  return { ref, value };
}

function Stat({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  label,
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const { ref, value } = useCountUp(target);
  return (
    <div className="flex flex-col gap-1">
      <span ref={ref} className="figure text-xl font-semibold text-white sm:text-2xl">
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
      <span className="text-xs uppercase text-white/60">{label}</span>
    </div>
  );
}

const TESTIMONIALS = [
  { name: "Roger Isaacs" },
  { name: "Jakob Zeise" },
  { name: "Jakob Zeise" },
] as const;

function TestimonialCard({ name }: { name: string }) {
  return (
    <div className="flex flex-col border-2 border-ink bg-brand-red">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-black px-5 py-5 sm:px-6">
        <Stat target={2000} prefix="+" label="Bd ft per shift" />
        <Stat target={0.5} decimals={1} prefix="+" suffix="%" label="Yield" />
        <Stat target={9} suffix="&quot;" label="Boards, cleanly" />
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <p className="text-sm leading-snug text-white sm:text-base">
          &ldquo;After installing our new Hasko MPEM-C, through put increased
          by 2k per shift. Yield increased by .5%, added ability to cut
          9&Prime; boards (with a much better cut). Out of square boards are
          a non-issue.&rdquo;
        </p>

        <div className="flex flex-1 flex-col justify-end gap-4">
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden border-2 border-ink sm:size-14">
              <Image
                src="/assets/testimonials/roger-isaacs.jpg"
                alt={name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5 text-white">
              <p className="font-display text-base font-semibold uppercase leading-[0.95] sm:text-lg">
                {name}
              </p>
              <p className="text-xs sm:text-sm">Production Manager, SFL</p>
            </div>
          </div>

          <a
            href="#machine-finder"
            className="flex h-10 items-center justify-center gap-1.5 bg-chip px-4 text-sm font-semibold text-black transition-colors hover:bg-white"
          >
            MPEM-C End Matcher
            <CaretRight size={16} weight="bold" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function Proof() {
  return (
    <section id="proof" className="relative overflow-hidden bg-brand-red">
      {/* blueprint grid texture — tiled at its native 1440x820 size and
          repeated, not stretched with `object-cover`: cover scales the
          artwork to each section's own height, so two sections of
          different heights sampled visibly different-scaled grids and the
          lines never lined up at the seam between them. A fixed-size
          repeating tile keeps every red section's grid identical. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[length:1440px_820px] bg-top bg-repeat opacity-90"
        style={{ backgroundImage: "url(/assets/hero-bg-grid.svg)" }}
        aria-hidden="true"
      />

      <div className="relative px-6 py-20 sm:px-10 md:py-28 xl:px-16">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display max-w-2xl text-3xl font-semibold uppercase leading-[1.05] text-white sm:text-5xl">
            What changes when a Hasko goes in.
          </h2>
          {/* The only outlined (non-filled) CTA on the page — deliberately
              secondary next to the card's own filled "MPEM-C End Matcher"
              link, per the colour rule: one filled/primary action per view. */}
          <a
            href="#machine-finder"
            className="flex h-12 w-[134px] shrink-0 items-center justify-center border-2 border-chip text-base font-semibold text-chip transition-colors hover:bg-chip hover:text-black"
          >
            View More
          </a>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} name={t.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
