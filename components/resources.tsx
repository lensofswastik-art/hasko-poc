"use client";

import Image from "next/image";

// CLAUDE.md §6, section 10 — document categories and counts, verbatim.
// Every document shows its revision date and file size per the brief; no
// dedicated resource-thumbnail photography exists, so each category borrows
// an existing, already-in-the-repo image rather than inventing new assets —
// the same substitution rule machines.json already uses for the 18 machines
// with no photo shoot of their own.
const RESOURCES = [
  {
    label: "Machine brochures",
    count: "21 documents",
    rev: "REV. 2026",
    image: "/assets/machines/gang-ripsaw.png",
  },
  {
    label: "Spec sheets",
    count: "21 documents",
    rev: "REV. 2026",
    image: "/assets/machines/end-matcher.png",
  },
  {
    label: "Operator manuals",
    count: "18 documents",
    rev: "REV. 2016",
    image: "/assets/machines/stripmaster.png",
  },
  {
    label: "Parts lists",
    count: "21 documents",
    rev: "REV. 2026",
    image: "/assets/industries/ripped-products.png",
  },
  {
    label: "Line layouts",
    count: "5 documents",
    rev: "REV. 2025",
    image: "/assets/industries/flooring.png",
  },
  {
    label: "Case studies",
    count: "3 documents",
    rev: "REV. 2026",
    image: "/assets/industries/dimensional-wood.png",
  },
] as const;

function ResourceCard({ resource }: { resource: (typeof RESOURCES)[number] }) {
  return (
    <div className="relative flex h-[470px] w-[325px] shrink-0 flex-col bg-black">
      <div className="relative m-2 h-[309px] overflow-hidden bg-surface">
        <Image
          src={resource.image}
          alt=""
          fill
          sizes="325px"
          className="object-cover"
        />
      </div>

      <div className="flex items-end justify-between px-2 pt-2">
        <p className="font-display max-w-[70%] text-xl font-semibold uppercase leading-none text-white sm:text-2xl">
          {resource.label}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 px-2 pb-2">
        <div className="flex flex-col gap-1">
          <span className="figure text-sm text-white/60">{resource.count}</span>
          <span className="figure text-sm text-white/60">{resource.rev}</span>
        </div>

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="shrink-0 bg-chip px-[15px] py-[13px] text-sm font-semibold text-black transition-colors hover:bg-white"
        >
          Browse
        </a>
      </div>
    </div>
  );
}

export function Resources() {
  return (
    <section id="resources" className="relative overflow-hidden bg-brand-red py-16 sm:py-20">
      {/* blueprint grid texture — anchored to this section's own top edge,
          same tiling as proof.tsx, parts-service.tsx and why-heavy-built.tsx
          so the tile phase carries through unbroken across every red
          section's seam. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[length:1440px_820px] bg-top bg-repeat opacity-90"
        style={{ backgroundImage: "url(/assets/hero-bg-grid.svg)" }}
        aria-hidden="true"
      />

      <div className="relative px-6 sm:px-10 xl:px-16">
        <span className="figure mb-10 block text-[11px] uppercase tracking-[0.14em] text-white/70 md:mb-16">
          ( 08 ) &mdash;&mdash;&mdash;&mdash; Resources
        </span>
        <h2 className="font-display max-w-2xl text-3xl font-semibold uppercase leading-[1.05] text-white sm:text-5xl">
          Everything downloadable, in one place.
        </h2>
      </div>

      {/* Marquee: the track is the resource list duplicated once, animated
          -50% via the same `marquee` keyframes stats-strip.tsx already
          uses, so at -50% the second copy sits exactly where the first
          started and the loop is seamless. motion-reduce:animate-none
          freezes the track in place (still all six cards, just static and
          scrollable) rather than stopping mid-loop. */}
      <div className="relative mt-14 overflow-x-auto">
        <div className="flex w-max animate-[marquee_36s_linear_infinite] gap-6 px-6 motion-reduce:animate-none sm:px-10">
          {[...RESOURCES, ...RESOURCES].map((resource, i) => (
            <ResourceCard key={`${resource.label}-${i}`} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  );
}
