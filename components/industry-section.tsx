"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { industries } from "@/lib/machines";

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

/**
 * Per Figma (node 298:795), this card row is wider than the viewport by
 * design — meant to be revealed by scrolling vertically through a pinned
 * section. That scroll-jack pattern now runs at every width, mobile
 * included: vertical scroll drives horizontal card movement everywhere.
 * What changes below `md` is the CARD itself, not the mechanism — no
 * hover on touch, so nothing is hover-gated: full width, height fits its
 * content instead of Figma's fixed 470px, and the description that's
 * normally a hover reveal is just always visible. The heading still stays
 * in normal flow above the cards on mobile rather than absolute-behind
 * them — full-width cards would blank it out completely on every pass,
 * which isn't the same "peek-through" effect the desktop overlap gives.
 */
export function IndustrySection() {
  const isDesktop = useIsDesktop();
  const sectionRef = useRef<HTMLElement>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);
  // Mobile's own scroll-jack frame height, measured in real pixels rather
  // than expressed as `h-svh`. `svh` on a real mobile browser is resolved
  // against the collapsing address bar and changes mid-scroll — inside a
  // `position: sticky` frame that's exactly the wrong property for a value
  // that moves, since the pinned frame's actual on-screen height can end up
  // shorter than what was measured, clipping the card underneath it (the
  // bug this whole mobile path exists to avoid). A plain pixel height,
  // sized once from the heading + card's real rendered heights, doesn't
  // have that failure mode — it's just a fixed number the same on every
  // device regardless of toolbar state.
  const [mobileFrameHeight, setMobileFrameHeight] = useState(0);

  useLayoutEffect(() => {
    function measure() {
      if (!trackWrapRef.current || !trackRef.current) return;
      // scrollWidth - clientWidth: the standard "how far left to bring the
      // trailing edge flush with the viewport" amount. Translating by the
      // full scrollWidth (tried previously) pushes the ENTIRE track past the
      // left edge — the last card overshoots off-screen into empty space
      // before the pin releases, instead of stopping flush at the right
      // edge. The heading-crossing effect doesn't need the overshoot: with
      // the track's pl-[38%] leading offset, every card already sweeps
      // across the heading mid-scroll on the way to this (smaller) stop
      // point — the sweep happens during the gesture, not at its end.
      const overflow =
        trackRef.current.scrollWidth - trackWrapRef.current.clientWidth;
      setMaxTranslate(Math.max(0, overflow));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (trackWrapRef.current) ro.observe(trackWrapRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    // Each card also runs its own x:60→0 entrance transition on mount (see
    // the card's initial/animate props below) — a transform, not a resize,
    // so ResizeObserver never sees it and can't trigger a re-measure once it
    // settles. If this effect's first measure() call lands mid-transition
    // (very likely: the last card's stagger delay alone is 360ms), it bakes
    // the still-offset width into maxTranslate permanently, and the last
    // card stops short of flush by however much it was still animating. One
    // settle-pass after the slowest card's delay + duration have both
    // elapsed corrects that without needing to touch the entrance animation.
    const settleTimer = window.setTimeout(measure, 1100);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(settleTimer);
    };
  }, [isDesktop]);

  // Mobile frame height: heading's own height + a small gap + the card's
  // rendered height, all in real px. Re-measured on the same triggers as
  // the horizontal-overflow effect above (layout, resize, post-entrance
  // settle) so it stays accurate as content/viewport changes.
  useLayoutEffect(() => {
    if (isDesktop) return;
    function measure() {
      if (!headingRef.current || !trackWrapRef.current) return;
      const headingH = headingRef.current.offsetHeight;
      const cardH = trackWrapRef.current.offsetHeight;
      setMobileFrameHeight(headingH + 24 + cardH);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (headingRef.current) ro.observe(headingRef.current);
    if (trackWrapRef.current) ro.observe(trackWrapRef.current);
    window.addEventListener("resize", measure);
    const settleTimer = window.setTimeout(measure, 1100);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(settleTimer);
    };
  }, [isDesktop]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxTranslate]);

  // Both platforms scroll-jack (vertical scroll drives horizontal card
  // movement) whenever the row actually overflows — the mechanism itself
  // isn't desktop-only. What differs by platform is how the pinned frame's
  // HEIGHT is expressed: desktop uses `h-svh` against a fixed section
  // height (`100svh + maxTranslate`); mobile uses `mobileFrameHeight`, a
  // real px number measured from the heading + card's actual rendered
  // heights. `svh` on a real mobile browser resolves against the
  // collapsing address bar — a value that moves mid-scroll — so reusing
  // desktop's `h-svh` sticky frame on mobile let the pinned frame's actual
  // on-screen height end up shorter than what was measured, clipping the
  // card's description and figures row on real devices (never reproduced
  // in desktop DevTools' mobile emulation, which simulates a static
  // viewport). A fixed px height doesn't have that failure mode.
  const pinned = maxTranslate > 0 && (isDesktop || mobileFrameHeight > 0);
  // Mobile's sticky frame also carries pt-[195px] (clears the fixed global
  // header — see the JSX comment below), which isn't part of the
  // heading+card measurement above; folding it in here keeps the frame
  // tall enough for that padding too, rather than 195px short of it.
  // Measured fixed-header height (logo row + condensed nav + announcement
  // bar) is ~134px; 150px clears it with a small buffer instead of the
  // 195px this replaces, which left ~60px of unnecessary dead space above
  // the heading once the section was actually scrolled into view.
  const MOBILE_HEADER_CLEARANCE = 150;
  const sectionHeight = isDesktop
    ? `calc(100svh + ${maxTranslate}px)`
    : `${mobileFrameHeight + MOBILE_HEADER_CLEARANCE + maxTranslate}px`;

  return (
    <section
      ref={sectionRef}
      id="industries"
      className="relative bg-black"
      style={pinned ? { height: sectionHeight } : undefined}
    >
      <div
        className={`${
          pinned
            ? "sticky top-0 pt-[150px] md:h-svh md:pt-0"
            : "flex flex-col gap-12 py-20 md:py-28"
        } relative overflow-hidden px-6 sm:px-10`}
      >
        {/* Desktop: absolute, sits behind the card track (z-0) so later cards
            slide over it as the row translates — per Figma's actual overlap.
            Mobile: normal block above the cards, no overlap (see file note).
            The pt-[150px] on the pinned wrapper (mobile only) clears the fixed
            global header (measured ~134px, logo row + condensed nav +
            announcement bar) with a small buffer — without it
            the heading's top edge sits flush with the viewport top, i.e.
            directly under the header, and is permanently hidden for as long
            as this section stays pinned. Desktop doesn't need it: the heading
            there is vertically centred (top-1/2), not flush to the top. */}
        <h2
          ref={headingRef}
          className={`font-display max-w-md text-3xl font-semibold uppercase leading-[1.05] text-white sm:text-5xl ${
            isDesktop ? "md:absolute md:left-10 md:top-1/2 md:z-0 md:-translate-y-1/2" : ""
          }`}
        >
          Four production lines, one engineering approach
        </h2>

        {/* Desktop: h-svh lets the heading sit absolutely behind a wrapper
            that fills the whole sticky viewport. Mobile: no h-svh (that was
            the source of the real-device clipping bug — see the pinned
            comment above) — mt-6 keeps the gap to the heading tight instead
            of the mt-10 this replaced, which read as too much dead space
            once the card is this close underneath a 4-line heading. */}
        <div
          ref={trackWrapRef}
          className={`-mx-6 mt-6 overflow-x-hidden px-6 sm:-mx-10 sm:mt-8 sm:px-10 md:mx-0 md:mt-0 md:overflow-hidden md:px-0 ${isDesktop ? "md:relative md:z-10 md:h-svh" : ""}`}
        >
          <motion.div
            ref={trackRef}
            style={pinned ? { x } : undefined}
            className={`flex w-max items-center gap-5 ${isDesktop ? "md:h-full md:pl-[38%]" : ""}`}
          >
            {industries.map((industry, i) => (
              <motion.a
                key={industry.slug}
                href={`?application=${industry.slug}#machine-finder`}
                className="group relative flex w-[calc(100vw-3rem)] shrink-0 flex-col overflow-hidden bg-white/8 backdrop-blur-[50px] sm:h-[470px] sm:w-[325px]"
                initial={{ x: 60, opacity: 0 }}
                animate={pinned ? { x: 0, opacity: 1 } : undefined}
                whileInView={pinned ? undefined : { x: 0, opacity: 1 }}
                viewport={pinned ? undefined : { once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.12,
                  ease: [0.2, 0.7, 0.3, 1],
                }}
              >
                {/* Hover (desktop pointer only, per Figma node 299:860): the
                    image collapses to a sliver, and the space it gives up is
                    filled by a description that fades in. On touch widths
                    there's no hover to gate on, so the image stays full
                    height and the description is simply always visible
                    (see the p below) instead of being unreachable content. */}
                <div className="relative m-2 h-[309px] shrink-0 overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.2,0.7,0.3,1)] md:group-hover:h-2">
                  <Image
                    src={industry.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 325px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-5 px-4 pb-4 pt-4 text-white">
                  <div className="flex flex-col gap-5">
                    <p className="font-display whitespace-pre-line text-xl font-semibold uppercase leading-[1.15] sm:text-2xl">
                      {industry.title}
                    </p>
                    <p className="text-base leading-normal text-[rgba(253,236,236,0.6)] opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                      {industry.description}
                    </p>
                  </div>
                  <div className="figure flex items-center justify-between text-base">
                    <span>{industry.machineCount} MACHINES</span>
                    <span>{industry.figure}</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
