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
const RADIUS = { image: 1.08, badge: 1, title: 0.9, desc: 0.82, model: 0.76, logo: 0.45 };
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

// anchorY (dial centre, relative to the stage's own top) = 0.54*D + 200 —
// 0.54*D is 1.08*R (the image thumbnail's radius, the outermost element),
// so the topmost point always lands exactly 200px below the stage's top
// edge regardless of dialSize (clearing the fixed global header, 177px
// measured). logoCoefficient carries that same relationship through to the
// deepest element (the logo, ratio 0.45): logoBottom = D*logoCoefficient +
// 200 + a small allowance for the logo's own height past its centre point.
const LOGO_COEFFICIENT = 0.54 - RADIUS.logo / 2 + 0.01223;

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
  const visibleHeight = dialSize * LOGO_COEFFICIENT + 200 + 40;

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
                top: dialSize * 0.54 + 200,
                transform: "translate(-50%, -50%)",
              }}
            >
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
                      322:640) sits on this same angle-0 axis, deeper toward
                      centre than even the model code. Nested here rather
                      than positioned separately against the dial: the
                      hand's top:X% coordinate system is already proven
                      correct (every other element uses it). It rides along
                      with node 3's reveal rather than getting its own
                      animation — a brand mark, not one of the 5 steps. */}
                  {node.angle === 0 && (
                    <div
                      className="absolute left-1/2 flex items-center"
                      style={{
                        top: `${TOP_PCT.logo}%`,
                        gap: dialSize * 0.01223,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
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
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 md:py-28">
          {/* Mobile: unchanged linear timeline — the brief keeps this flow
              as-is, only the desktop layout moves to the circular dial. */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2 className="font-display max-w-xl text-3xl font-semibold uppercase leading-[1.05] text-white">
                One line. <br /> One number to call.
              </h2>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-body">
              Hasko and Mekanika build the whole line, from the moment
              lumber enters the plant to the moment finished flooring
              leaves it. Scanning, ripping, matching, handling. Engineered
              to run together.
            </p>
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

          <p className="mt-16 text-center text-lg italic text-muted">
            This is why a buyer chooses Hasko over a component supplier.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="#contact"
              className="bg-chip px-[15px] py-[13px] text-base font-semibold text-black transition-colors hover:bg-white"
            >
              Talk to an engineer about your line →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
