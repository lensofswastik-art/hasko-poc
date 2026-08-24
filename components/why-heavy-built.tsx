"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);
    const onChange = () => setIsDesktop(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

// CLAUDE.md §6, section 08 — the four "Why heavy-built" cards, verbatim.
const CARDS = [
  {
    index: "01",
    title: "Fewer\nwear parts",
    body: "We design out the gears, chains and sprockets that fail first.",
  },
  {
    index: "02",
    title: "Direct-coupled\narbors",
    body: "No belts to slip or retension. Power goes where it is meant to go.",
  },
  {
    index: "03",
    title: "Heavy-built\nframes",
    body: "Mass absorbs vibration. Vibration is what costs you cut quality and bearing life at high feed rates.",
  },
  {
    index: "04",
    title: "Simple to set up\nand operate",
    body: "A machine your crew can change over quickly is a machine that actually runs at rated capacity.",
  },
] as const;

// One scroll pass through the pinned section is divided into CARDS.length
// equal bands; whichever band scrollYProgress currently sits in is the
// active card. Reused for both the sticky-scroll desktop version and to
// size how tall the pin needs to be (more cards == a longer scroll runway).
function bandIndex(progress: number, count: number) {
  return Math.min(count - 1, Math.floor(progress * count));
}

export function WhyHeavyBuilt() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const [active, setActive] = useState(0);
  const [trackDistance, setTrackDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Same opacity/style-via-motion-value workaround used elsewhere in this
  // build (hero.tsx, integrated-lines.tsx): framer-motion's own `style`
  // binding on this stack doesn't reliably reach the DOM, but subscribing
  // to the motion value and setting state directly does.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(bandIndex(v, CARDS.length));
  });

  // Mobile: the card strip is one continuous horizontal track, and how far
  // it needs to slide left is (full track width - viewport width) — the
  // amount hidden off the right edge. Measured after layout so it's exact
  // at any viewport size, not a guessed card-width * count constant.
  useLayoutEffect(() => {
    if (isDesktop) return;
    function measure() {
      if (!mobileTrackRef.current) return;
      setTrackDistance(mobileTrackRef.current.scrollWidth - window.innerWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isDesktop]);

  const mobileX = useTransform(scrollYProgress, [0, 1], [0, -trackDistance]);
  useMotionValueEvent(mobileX, "change", (v) => {
    if (reducedMotion || isDesktop) return;
    if (mobileTrackRef.current) mobileTrackRef.current.style.transform = `translateX(${v}px)`;
  });
  useLayoutEffect(() => {
    if (!mobileTrackRef.current || isDesktop) return;
    mobileTrackRef.current.style.transform = reducedMotion
      ? "translateX(0px)"
      : `translateX(${mobileX.get()}px)`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, reducedMotion, trackDistance]);

  const card = CARDS[active];

  return (
    <section
      id="why-heavy-built"
      ref={sectionRef}
      className={`relative bg-brand-red ${reducedMotion ? "" : "h-[280vh]"}`}
    >
      {/* Sticky viewport-height frame: background, heading and card all live
          IN HERE so the whole frame — grid included — stays visually fixed
          in the viewport for the entire scroll-jack pass, and only the card
          content changes underneath it. Putting the grid on the OUTER tall
          section instead (an earlier version of this fix) painted it onto a
          280vh-tall element, so it necessarily travelled with the page as
          the section scrolled by — the exact "grid scrolling" bug this
          reverts. Cross-section seam continuity (why this got moved out
          the first time) is a smaller visual nit than a moving background
          during the card-cycle interaction itself. */}
      {/* top/height offset by the fixed header's own height (measured
          ~177px) so this frame centres its content in the space actually
          visible BELOW the header, not across the full viewport height —
          without the offset, `items-center` centred against 100svh
          including the space the header sits in front of, which visually
          read as "pinned flush under the nav" rather than centred. */}
      <div className="relative sticky top-[177px] flex h-[calc(100svh-177px)] items-center overflow-hidden md:h-[calc(100vh-177px)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[length:1440px_820px] bg-top bg-repeat opacity-90"
          style={{ backgroundImage: "url(/assets/hero-bg-grid.svg)" }}
          aria-hidden="true"
        />

        <div className="relative flex w-full flex-col gap-6 py-16 sm:gap-16 sm:py-20 md:flex-row md:items-center md:justify-between md:gap-8 md:py-0">
          <div className="flex max-w-xl flex-col gap-6 px-6 text-white sm:gap-10 sm:px-10 md:max-w-[852px] md:h-[472px] md:justify-between md:gap-0 md:py-2 md:pl-10">
            <h2 className="font-display text-3xl font-semibold uppercase leading-[1.05] sm:text-5xl md:whitespace-nowrap md:text-[52px]">
              We spent decades rebuilding
              <br />
              other people&rsquo;s machines.
              <br />
              Then we built ours.
            </h2>
            <p className="max-w-lg text-lg leading-none sm:leading-relaxed text-white/85">
              Hasko started in 1930 as a rebuilder. Forty years of pulling
              apart worn machines taught us exactly which parts fail and why.
              Every machine we build now is designed around that.
            </p>
          </div>

          {/* Mobile: cards move horizontally as the page scrolls vertically
              — not a separate touch-drag carousel. scrollYProgress through
              the pinned runway drives translateX across the strip, same
              motion-value-to-DOM workaround as the rest of the build,
              rather than framer's `style` prop. */}
          <div className="overflow-hidden md:hidden">
            <div ref={mobileTrackRef} className="flex gap-4 pl-6 will-change-transform">
              {CARDS.map((c) => (
                <div key={c.index} className="w-[85vw] shrink-0">
                  <Card card={c} />
                </div>
              ))}
              <div className="w-2 shrink-0" aria-hidden="true" />
            </div>
          </div>

          {/* Desktop: one sticky card, flush to the actual viewport's right
              edge — no gutter, no max-width container — swapped by scroll
              position, per the design. */}
          <div className="relative hidden w-[483px] shrink-0 self-end md:block">
            <Card card={card} activeIndex={active} total={CARDS.length} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  card,
  activeIndex,
  total,
}: {
  card: (typeof CARDS)[number];
  activeIndex?: number;
  total?: number;
}) {
  const lines = card.title.split("\n");
  return (
    <motion.div
      key={card.index}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="flex h-[472px] flex-col justify-between bg-black p-[50px]"
    >
      <span className="figure text-4xl uppercase leading-[0.9] text-white">
        [ {card.index} ]
      </span>

      <div className="flex flex-col gap-[50px]">
        <div className="flex flex-col gap-[50px] text-white">
          <h3 className="font-display text-4xl font-semibold uppercase leading-[0.9]">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h3>
          <p className="max-w-[338px] text-xl leading-none sm:leading-relaxed text-white/60">
            {card.body}
          </p>
        </div>

        {/* Step indicator — matches the Figma reference's bar group: the
            active step wide, the rest thin. Only meaningful on desktop,
            where cards actually cycle by scroll; omitted from the mobile
            flat-list Card instances (activeIndex/total left undefined). */}
        {typeof activeIndex === "number" && total && (
          <div className="flex items-center gap-2" aria-hidden="true">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-[43px] bg-white transition-all duration-300 ${
                  i === activeIndex ? "w-[38px]" : "w-[5px]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
