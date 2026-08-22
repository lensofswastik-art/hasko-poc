"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getMachineBySlug, getMachineImage } from "@/lib/machines";

const NODES = [
  {
    index: "01",
    title: "Infeed",
    description: "Package breakdown & unscrambling",
    model: "HSBU",
    machineSlug: "package-breakdown-and-unscrambler",
    angle: -40,
  },
  {
    index: "02",
    title: "Optimise",
    description: "Scanning, defect detection, ripping",
    model: "HSLS · SR",
    machineSlug: "gang-ripsaw",
    angle: -20,
  },
  {
    index: "03",
    title: "Surface",
    description: "Pre-surfacing & planing",
    model: "FSP-EF",
    machineSlug: "stripmaster-pre-surfacer",
    angle: 0,
  },
  {
    index: "04",
    title: "Profile",
    description: "End matching & side matching",
    model: "MPEM · HSSM",
    machineSlug: "endmatcher",
    angle: 20,
  },
  {
    index: "05",
    title: "Handle",
    description: "Automated material handling",
    model: "MEKANIKA",
    machineSlug: null,
    angle: 40,
  },
] as const;

// Node 5 (Mekanika) isn't a Hasko machine, so it has no machines.json record
// to borrow a photo from — it reuses a real, already-in-the-repo industry
// shot (in-plant material handling) rather than inventing new imagery.
const FALLBACK_HANDLE_IMAGE = "/assets/industries/ripped-products.png";

function nodeImage(slug: string | null) {
  if (!slug) return FALLBACK_HANDLE_IMAGE;
  const machine = getMachineBySlug(slug);
  return machine ? getMachineImage(machine) : FALLBACK_HANDLE_IMAGE;
}

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

// Each node sits on a "hand" — an element reaching from the dial's centre to
// its rim, rotated to the node's angle. A hand's own height IS the radius,
// so a child positioned with top:X% inside it lands at X% of the radius
// from centre, with zero JS measurement: it's correct at any rendered size.
// Figma has the image thumbnail furthest from centre, then the number badge
// sitting exactly on the rim, then title/description/model progressively
// closer in. The logo lockup sits deeper still (0.45, well past the model
// codes) so it lands near the bottom of the visible dial with clear
// breathing room above it, instead of crowding the row right above it.
// image is deliberately close enough to the badge/arc's own radius (1)
// that it overlaps — the images are meant to sit BEHIND the circle surface
// and its arc, poking up above the rim with the rest tucked under it, not
// float entirely clear of it. That depth ordering is handled by DOM order
// (images render before the circle+arc; badges/text render after), not by
// z-index — each "hand" has its own rotate transform, which (per the CSS
// spec) makes it establish its own stacking context, so z-index on a
// child can't reach out and reorder it against a sibling SVG anyway.
const RADIUS = {
  image: 1.08,
  badge: 1,
  title: 0.9,
  desc: 0.82,
  model: 0.76,
  // Logo lockup and closing line used to be two independently-positioned
  // ratios (0.45 and 0.28) — their gap was whatever the DIFFERENCE between
  // two radius fractions happened to render as, scaling with dialSize
  // rather than being an actual fixed value. They're one flex column now
  // (a real 16px gap between them, via CSS gap, at any dialSize) anchored
  // by this single ratio — moved up from 0.45 to 0.58 to close some of the
  // gap above it too.
  partnership: 0.58,
};
// The hand's own `top:X%` coordinate runs the opposite way from RADIUS
// (0% at the rim/dial edge, 100% at the centre — see the hand's CSS below),
// so every ratio gets inverted once here rather than at each of the 5
// call sites.
const TOP_PCT = Object.fromEntries(
  Object.entries(RADIUS).map(([key, r]) => [key, (1 - r) * 100]),
) as Record<keyof typeof RADIUS, number>;

function arcPath(r: number, cx: number, cy: number, fromDeg: number, toDeg: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const point = (deg: number) => ({
    x: cx + r * Math.sin(rad(deg)),
    y: cy - r * Math.cos(rad(deg)),
  });
  const p1 = point(fromDeg);
  const p2 = point(toDeg);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`;
}
// Same viewBox units as the RADIUS.badge ratio (1 = the badge's own radius,
// 500 units in a 0–1000 viewBox) — the arc is drawn along the same rim the
// number badges sit on, from the first node's angle to the last's.
const ARC_D = arcPath(497, 500, 500, NODES[0].angle, NODES[NODES.length - 1].angle);

// anchorY (dial centre, relative to the stage's own top) =
// ANCHOR_COEFFICIENT*D + 200 — ANCHOR_COEFFICIENT*D is RADIUS.image*R (the
// image thumbnail's radius, the outermost element), so the topmost point
// always lands exactly 200px below the stage's top edge regardless of
// dialSize (clearing the fixed global header, 177px measured).
// DEEPEST_COEFFICIENT carries that same relationship through to the
// deepest element — the partnership block (logo row + closing line as one
// flex column): deepestBottom = D*DEEPEST_COEFFICIENT + 200, positioning
// the block's CENTRE. The block's own height is no longer purely
// D-proportional (the closing line and the 16px gap are fixed regardless
// of dialSize), so getting from centre to the block's actual bottom edge
// needs a real fixed allowance, not the small rounding fudge the old
// single-ratio elements used — see visibleHeight below.
const ANCHOR_COEFFICIENT = RADIUS.image / 2;
const DEEPEST_COEFFICIENT = ANCHOR_COEFFICIENT - RADIUS.partnership / 2;

export function IntegratedLines() {
  const isDesktop = useIsDesktop();
  const prefersReducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  // Previously this dial lived inside a `position: sticky` scroll-jack —
  // pinned while scrolling drove a staggered reveal. Every fix to that
  // approach (fitting the header, sizing the circle, positioning the logo)
  // kept resurfacing the same root problem: a sticky box shorter than the
  // viewport sticks glued to the top and leaves whatever's below it (still
  // inside the same tall pinned wrapper) as bare background — dead black
  // space with no content to fill it. The wheel doesn't need to share a
  // viewport with anything, so it doesn't need to be pinned at all: normal
  // document flow, sized to exactly fit its content, structurally can't
  // leave space below it because nothing forces the section to be taller
  // than what it actually contains.
  const [dialSize, setDialSize] = useState(1200);

  useLayoutEffect(() => {
    if (!isDesktop) return;
    function measure() {
      if (!stageRef.current) return;
      const w = stageRef.current.clientWidth;
      // No fixed 1880px ceiling: on a wide viewport, capping the diameter
      // well below the available width is what made the circle look small
      // and full/dominant instead of a flat sliver. 1.15w (not the
      // viewport width itself) is calibrated from measured clipping of the
      // outer nodes' rotated images at a larger multiplier — their true
      // edge (own half-width + rotation) reaches further out than the rim
      // radius alone suggests.
      setDialSize(w * 1.15);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isDesktop]);

  // The stage is just tall enough to show down to the logo lockup plus a
  // small margin — anything the dial renders below that line is simply
  // clipped by this box's own overflow-hidden, and because the section is
  // in normal flow (not stretched to fill a pinned viewport), there's
  // nothing left over afterward for dead space to occupy.
  // +90 (not the old +40) covers the block's fixed-height half (16px gap +
  // the closing line's own ~2-line height, roughly 56px at text-lg — none
  // of that scales with dialSize the way the logo row does) on top of the
  // usual small margin.
  const visibleHeight = dialSize * DEEPEST_COEFFICIENT + 200 + 90;

  return (
    <section id="integrated-lines" className="relative bg-black">
      {isDesktop ? (
        <>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pb-16 pt-20 text-center sm:px-10 md:pt-28">
            <h2 className="font-display text-3xl font-semibold uppercase leading-[1.05] text-white sm:text-5xl">
              One line.
              <br />
              One number to call.
            </h2>
            <p className="max-w-lg text-lg leading-relaxed text-body">
              Hasko and Mekanika build the whole line, from the moment
              lumber enters the plant to the moment finished flooring
              leaves it. Scanning, ripping, matching, handling. Engineered
              to run together.
            </p>
            <a
              href="#contact"
              className="bg-chip px-[15px] py-[13px] text-base font-semibold text-black transition-colors hover:bg-white"
            >
              Talk to an engineer
            </a>
          </div>

          <div
            ref={stageRef}
            className="relative overflow-hidden pb-8"
            style={{ height: visibleHeight }}
          >
            <div
              className="absolute"
              style={{
                width: dialSize,
                height: dialSize,
                left: "50%",
                top: dialSize * ANCHOR_COEFFICIENT + 200,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Images render BEFORE the circle+arc so the opaque circle
                  fill paints over their lower portion — the "poking up from
                  behind the rim" look — while badges/text (rendered further
                  below, after the svg) stay on top of everything. A
                  duplicate hand rather than reordering JSX within the main
                  one below: that hand's rotate transform makes it its own
                  stacking context, so a child inside it can never paint
                  behind a sibling of the hand itself (the svg) — moving
                  the image out to its own hand, positioned identically, is
                  the only way to actually split the depth ordering. */}
              {NODES.map((node, i) => (
                <motion.div
                  key={`image-${node.model}`}
                  className="absolute bottom-1/2 left-1/2 h-1/2 w-0"
                  style={{ transformOrigin: "bottom", rotate: node.angle }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.5, delay: i * 0.12, ease: [0.2, 0.7, 0.3, 1] }
                  }
                >
                  {/* A plain w-[9%] here would resolve against the hand's
                      own width — which is 0, by design (it's a positioning
                      axis, not a box) — collapsing this to nothing, so it's
                      sized from dialSize (0.09 of the diameter, matching
                      the ratio measured off Figma) instead. */}
                  <div
                    className="absolute left-1/2 overflow-hidden bg-surface"
                    style={{
                      top: `${TOP_PCT.image}%`,
                      width: dialSize * 0.09,
                      aspectRatio: "1 / 1",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Image
                      src={nodeImage(node.machineSlug)}
                      alt=""
                      fill
                      sizes="220px"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              ))}

              <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <circle cx="500" cy="500" r="500" fill="#1E1E1E" />
                <motion.path
                  d={ARC_D}
                  fill="none"
                  stroke="#8E1116"
                  strokeWidth={6}
                  strokeLinecap="round"
                  initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                />
              </svg>

              {NODES.map((node, i) => (
                <motion.div
                  key={node.model}
                  // bottom:50% (not top:50%) anchors the hand's BOTTOM edge
                  // at the dial's centre, so height:50% extends it UPWARD
                  // toward the rim — anchoring by top instead put the hand
                  // extending downward into the circle's lower half, which
                  // is exactly the wrong direction and put every node
                  // hundreds of pixels below the fold.
                  className="absolute bottom-1/2 left-1/2 h-1/2 w-0"
                  style={{ transformOrigin: "bottom", rotate: node.angle }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.5, delay: i * 0.12, ease: [0.2, 0.7, 0.3, 1] }
                  }
                >
                  <div
                    className="absolute left-1/2 flex size-[30px] items-center justify-center rounded-full bg-brand-red"
                    style={{
                      top: `${TOP_PCT.badge}%`,
                      transform: `translate(-50%, -50%) rotate(${-node.angle}deg)`,
                    }}
                  >
                    <span className="figure text-sm text-white">{node.index}</span>
                  </div>

                  <h3
                    className="font-display absolute left-1/2 whitespace-nowrap text-2xl font-semibold uppercase leading-none text-white"
                    style={{
                      top: `${TOP_PCT.title}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {node.title}
                  </h3>

                  <p
                    className="absolute left-1/2 text-center text-base leading-snug text-body"
                    style={{
                      top: `${TOP_PCT.desc}%`,
                      width: dialSize * 0.101,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {node.description}
                  </p>

                  <a
                    href={node.machineSlug ? "#machine-finder" : "#automation"}
                    className="figure absolute left-1/2 whitespace-nowrap text-sm uppercase text-white underline decoration-white/30 decoration-1 underline-offset-4 transition-colors hover:text-white/70"
                    style={{
                      top: `${TOP_PCT.model}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {node.model}
                  </a>

                  {/* Figma's "Hasko × Mekanika" partnership lockup (node
                      322:640) plus the closing line mobile already carries
                      under it — one flex column now, not two independently
                      -positioned ratios, so the gap between them is a real
                      16px (via CSS gap) at any dialSize rather than
                      whatever two radius fractions happened to render as.
                      Nested in this hand rather than positioned separately
                      against the dial: the hand's top:X% coordinate system
                      is already proven correct (every other element uses
                      it). Rides along with node 3's reveal rather than
                      getting its own animation — a brand mark, not one of
                      the 5 steps. */}
                  {node.angle === 0 && (
                    <div
                      className="absolute left-1/2 flex flex-col items-center gap-4"
                      style={{
                        top: `${TOP_PCT.partnership}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="flex items-center" style={{ gap: dialSize * 0.01223 }}>
                        <div
                          className="relative"
                          style={{ height: dialSize * 0.02447, width: dialSize * 0.108 }}
                        >
                          <Image src="/assets/haskologo-header.svg" alt="Hasko" fill sizes="203px" />
                        </div>
                        <span
                          className="text-brand-red"
                          style={{ fontSize: dialSize * 0.02128 }}
                        >
                          ×
                        </span>
                        <div
                          className="relative"
                          style={{ height: dialSize * 0.02447, width: dialSize * 0.1016 }}
                        >
                          <Image
                            src="/mechanica.png"
                            alt="Mekanika"
                            fill
                            sizes="191px"
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <p
                        className="text-center text-lg italic text-muted"
                        style={{ width: dialSize * 0.34 }}
                      >
                        This is why a buyer chooses Hasko over a component
                        supplier.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 md:py-28">
          {/* Mobile: unchanged linear timeline — the brief keeps this flow
              as-is, only the desktop layout moves to the circular dial.
              CTA copy and position match desktop ("Talk to an engineer"
              right after the standfirst, not stranded at the end after all
              5 nodes) — but H2 stays centred while the standfirst and CTA
              go left-aligned, an intentional asymmetry rather than fully
              mirroring desktop's all-centred block. */}
          <div className="flex flex-col gap-6">
            <h2 className="font-display max-w-xl text-center text-3xl font-semibold uppercase leading-[1.05] text-white">
              One line. <br /> One number to call.
            </h2>
            <p className="max-w-md text-base leading-relaxed text-body">
              Hasko and Mekanika build the whole line, from the moment
              lumber enters the plant to the moment finished flooring
              leaves it. Scanning, ripping, matching, handling. Engineered
              to run together.
            </p>
            <a
              href="#contact"
              className="self-start bg-chip px-[15px] py-[13px] text-base font-semibold text-black transition-colors hover:bg-white"
            >
              Talk to an engineer
            </a>
          </div>

          <div className="relative mt-16">
            <div
              aria-hidden="true"
              className="absolute bottom-6 left-0 top-1.5 w-px bg-line"
            />

            <ol className="relative flex flex-col gap-10">
              {NODES.map((node) => (
                <li key={node.model} className="relative flex gap-5 pl-8">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 size-3 -translate-x-1/2 rounded-full bg-brand-red"
                  />

                  <div className="flex flex-1 flex-col gap-3">
                    <span className="figure text-sm text-muted">{node.index}</span>
                    <h3 className="font-display text-xl font-semibold uppercase leading-none text-white">
                      {node.title}
                    </h3>
                    <p className="text-base leading-relaxed text-body">
                      {node.description}
                    </p>

                    <a
                      href={node.machineSlug ? "#machine-finder" : "#automation"}
                      className="figure mt-1 text-sm uppercase text-white underline decoration-white/30 decoration-1 underline-offset-4 transition-colors hover:text-white/70"
                    >
                      {node.model}
                    </a>

                    <div className="relative mt-2 h-24 w-full max-w-[180px] overflow-hidden bg-surface">
                      <Image
                        src={nodeImage(node.machineSlug)}
                        alt=""
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Present on desktop (inside the wheel, node 322:640) but
              missing here entirely. Same lockup, static sizing since
              there's no dial diameter to scale it against on this layout. */}
          <div className="mt-16 flex items-center justify-center gap-3">
            <div className="relative h-9 w-[159px]">
              <Image src="/assets/haskologo-header.svg" alt="Hasko" fill />
            </div>
            <span className="text-2xl text-brand-red">×</span>
            <div className="relative h-9 w-[147px]">
              <Image src="/mechanica.png" alt="Mekanika" fill className="object-contain" />
            </div>
          </div>

          <p className="mt-16 text-center text-lg italic text-muted">
            This is why a buyer chooses Hasko over a component supplier.
          </p>
        </div>
      )}
    </section>
  );
}
