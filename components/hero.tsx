"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// Stable references: useTransform must receive the same array identity on
// every render, or its internal DOM-writing subscription can desync from
// the MotionValue it reads.
const SCALE_RANGE: number[] = [0, 0.55];
// The video's rest position sits well right-of-centre (right-[9%] top-[27%],
// smaller now to clear the CTA), so scaling from its own centre needs a much
// larger factor to reach the LEFT edge than the right — 7.2x is the measured
// requirement at 1440x900 plus a safety margin for other viewport ratios.
const SCALE_OUTPUT: number[] = [1, 7.2];
const VIDEO_OPACITY_RANGE: number[] = [0.55, 0.85];
const OPACITY_OUTPUT: number[] = [1, 0];
const COPY_OPACITY_RANGE: number[] = [0, 0.2];

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Desktop only: the video grows from its small inset frame to fill the
  // viewport, then fades so the next section can take over. Reduced-motion
  // and mobile both skip this — see the video element's own guards below.
  // Sharp edges throughout — no border-radius, at rest or while scaling.
  const scale = useTransform(scrollYProgress, SCALE_RANGE, SCALE_OUTPUT);
  const videoOpacity = useTransform(
    scrollYProgress,
    VIDEO_OPACITY_RANGE,
    OPACITY_OUTPUT,
  );
  const copyOpacity = useTransform(
    scrollYProgress,
    COPY_OPACITY_RANGE,
    OPACITY_OUTPUT,
  );

  // Opacity applied imperatively via a direct subscription rather than the
  // motion.div `style` prop: on this stack (React 19 / Next 16 Turbopack /
  // framer-motion 13), opacity-only style bindings on a motion.div were
  // reproducibly computing correctly (confirmed via motionValue.get()) but
  // never reaching the element's inline style — while transform/borderRadius
  // on the very same element updated fine. Subscribing and writing the ref's
  // style directly sidesteps whatever internal path was dropping it.
  // The scroll-zoom is a JS scroll-position effect, not a CSS animation or
  // transition — the reduced-motion block in globals.css can't touch it, so
  // it's gated here explicitly. Reduced motion gets the video at rest,
  // fully visible, in its inset frame, with no scroll-linked change at all.
  useMotionValueEvent(videoOpacity, "change", (v) => {
    if (reducedMotion) return;
    if (videoWrapperRef.current) videoWrapperRef.current.style.opacity = String(v);
  });
  useMotionValueEvent(copyOpacity, "change", (v) => {
    if (reducedMotion) return;
    if (copyRef.current) copyRef.current.style.opacity = String(v);
  });

  // "change" only fires on updates after mount — set the initial value too,
  // in case the page loads already scrolled (e.g. browser scroll restore).
  useLayoutEffect(() => {
    if (videoWrapperRef.current) {
      videoWrapperRef.current.style.opacity = reducedMotion
        ? "1"
        : String(videoOpacity.get());
    }
    if (copyRef.current) {
      copyRef.current.style.opacity = reducedMotion
        ? "1"
        : String(copyOpacity.get());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`relative bg-brand-red ${reducedMotion ? "md:h-[100svh]" : "md:h-[240vh]"
        }`}
    >
      {/* Mobile has no scroll effect at all, so forcing this to h-[100svh]
          (as md+ needs, to give the pinned scroll-zoom something to measure
          against) only bought empty red space: with the proof-stat row now
          its own section rather than living in the hero, headline+CTA+video
          together are shorter than a full screen, and centering that block
          in the leftover space (the old flex-1/justify-center below) split
          the gap awkwardly above and below instead of shrinking it. Auto
          height lets the section end where its content ends. */}
      <div className="sticky top-0 flex w-full flex-col overflow-hidden bg-brand-red md:h-screen md:block">
        {/* blueprint grid texture — real Figma export, not hand-drawn (node 286:757) */}
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/assets/hero-bg-grid.svg"
            alt=""
            fill
            priority
            className="pointer-events-none object-cover opacity-90"
          />
        </div>

        {/* Mobile: normal flow, packed from the top rather than centred —
            pt-[195px] clears the measured header height (~130px, announcement
            bar + logo row) with generous room to breathe, not just the bare
            minimum. Desktop (md+): absolute, positioned to match Figma's
            actual coordinates (headline top ~64%, button bottom-right) — not
            a flex stack, so nothing is invented that isn't in the design. */}
        <div className="relative z-10 flex flex-col gap-6 px-6 pb-14 pt-[195px] sm:px-10 md:absolute md:inset-0 md:block md:px-0 md:pb-0 md:pt-0">
          <div
            ref={copyRef}
            className="max-w-2xl md:absolute md:left-[2.8%] md:top-[62%] md:max-w-[70%]"
          >
            {/* Fluid, not stepped: a fixed jump to 86px right at the md
                breakpoint (768px) made the headline wrap onto 5 lines on
                tablet-width viewports, tall enough to collide with the
                button positioned at a fixed top-% below it. clamp() scales
                continuously instead — 6vw is ~46px at 768, not 86px.
                Below 768 the clamp floors flat at 44px (6vw doesn't clear
                that floor until ~733px wide), which is too large for
                "MACHINES THAT ARE" — the longest of the three hard-broken
                lines — to fit on one line inside a 390px phone's padded
                width, so it wrapped again onto its own orphaned line.
                Measured directly: "MACHINES THAT ARE" (the longest of the
                three hard-broken lines) scales at ~10.34px of width per 1px
                of font-size, and a fixed px value that clears a 390px phone
                (32px) still wraps a 4th orphan line on a 360px one. A fluid
                clamp keyed to vw tracks the padded-width budget at any phone
                size instead of one fixed breakpoint's worth of it — floor
                and ceiling are cosmetic bounds, the calc() is what's actually
                sized to fit. It tops out at 44px right where the sm: clamp
                below starts, so the handoff at 640px is seamless. */}
            <h1 className="font-display text-[clamp(24px,calc(9.5vw_-_5px),44px)] font-semibold uppercase leading-[1.1] text-white sm:text-[clamp(44px,6vw,86px)] sm:leading-[0.95]">
              Machines that are
              <br />
              still running in
              <br />
              25 years
            </h1>
          </div>

          <a
            href="#machine-finder"
            className="flex w-full items-center justify-center bg-chip px-[15px] py-4 text-base font-semibold text-black transition-colors hover:bg-white md:absolute md:right-[3%] md:top-[88%] md:w-fit md:py-[13px]"
          >
            Browse all 21 machines
          </a>
        </div>

        {/* Mobile: video sits in normal flow, under the text/CTA, no scroll effect */}
        <div className="relative z-10 aspect-video w-full shrink-0 bg-black md:hidden">
          <video
            className="h-full w-full object-cover"
            src="/hasko.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Hasko machinery in operation"
          />
        </div>

        {/* Desktop: scroll-driven video, grows from an inset frame to fill the screen, then fades */}
        <motion.div
          ref={videoWrapperRef}
          className="pointer-events-none absolute right-[9%] top-[27%] hidden aspect-video w-[24%] overflow-hidden bg-black shadow-2xl md:block"
          style={reducedMotion ? undefined : { scale }}
        >
          <video
            className="h-full w-full object-cover"
            src="/hasko.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Hasko machinery in operation"
          />
        </motion.div>
      </div>
    </section>
  );
}
