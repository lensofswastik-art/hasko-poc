"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Archive,
  CaretDown,
  CaretRight,
  Columns,
  Cube,
  Gauge,
  Knife,
  List,
  MagicWand,
  MagnifyingGlass,
  Package,
  Phone,
  Rows,
  Ruler,
  Scan,
  Scissors,
  Shapes,
  Shuffle,
  Sliders,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { industries, machineCategories } from "@/lib/machines";
import { AnnouncementBar } from "./announcement-bar";

const NAV_LINKS = [
  { label: "Industries", href: "#industries", menu: "industries" as const },
  { label: "Machines", href: "#machine-finder", menu: "machines" as const },
  { label: "Automation", href: "#automation" },
  { label: "Parts & Service", href: "#parts-service" },
  { label: "About", href: "#why-heavy-built" },
];

// One icon per industry slug — a plain visual anchor for the mega-menu grid,
// not a claim about the machinery itself. Red per the request; --red-light
// isn't a token in this pivot's reduced palette, so brand-red at this small,
// non-text glyph size is the closest fit already in use elsewhere (see
// integrated-lines.tsx's red-on-black icon treatment).
const INDUSTRY_ICONS: Record<string, typeof Rows> = {
  flooring: Rows,
  "ripped-products": Ruler,
  "dimensional-wood": Cube,
  moulding: Columns,
};

// One icon per machine category label — same plain-visual-anchor role as
// INDUSTRY_ICONS above, keyed by the label string since machineCategories
// (shared with the footer) is a flat string list, not slugged records.
const MACHINE_ICONS: Record<string, typeof Rows> = {
  "Board ripping": Scissors,
  "End matching": Shapes,
  "Side matching": Shuffle,
  Planing: Sliders,
  Chopping: Knife,
  Scanning: Scan,
  "Feeding systems": Gauge,
  "Material handling": Package,
  "Special machines": MagicWand,
  "Used machinery": Archive,
};

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openMenu]);

  return (
    <header
      className={`transition-colors duration-200 ${
        scrolled ? "bg-black/80 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      {/* Mobile/tablet: full-width strip above the logo/hamburger row — at
          this width the header row only has two other items, so a centered
          compact widget has nowhere to go but clipped. Desktop swaps to the
          compact centered widget inside row 1 below. */}
      <div className="lg:hidden">
        <AnnouncementBar full />
      </div>

      {/* Row 1: logo / announcement widget (desktop, truly centered) / Request a Quote or hamburger */}
      <div className="flex items-center justify-between gap-4 px-6 pt-5 sm:px-10 xl:px-16">
        <Link href="/" className="flex flex-col gap-1">
          <Image
            src="/assets/haskologo-header.svg"
            alt="Hasko"
            width={133}
            height={30}
            priority
          />
          <span className="figure text-sm text-white">Since 1930</span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <AnnouncementBar />
        </div>

        <div className="hidden lg:block">
          <a
            href="#contact"
            className="whitespace-nowrap bg-chip px-[15px] py-[13px] text-base font-semibold text-black transition-colors hover:bg-white"
          >
            Request a Quote
          </a>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex size-11 items-center justify-center text-white lg:hidden"
        >
          {mobileOpen ? <X size={26} /> : <List size={26} />}
        </button>
      </div>

      {/* Row 2: primary nav, divided from row 1 by a hairline. Relative
          anchor for both mega-menus below — they're positioned against
          THIS row (left-0 right-0), not against whichever trigger opened
          them, so "Industries" near the far left doesn't centre a wide
          panel on itself and spill off the left edge of the viewport. */}
      <div
        className="relative mt-6 hidden items-center justify-between border-t border-line px-6 pb-6 pt-5 sm:px-10 xl:px-16 lg:flex"
        onMouseLeave={() => setOpenMenu(null)}
      >
        <nav className="flex items-center gap-8" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.menu && setOpenMenu(item.menu)}
            >
              <Link
                href={item.href}
                onClick={(e) => {
                  if (!item.menu) return;
                  e.preventDefault();
                  setOpenMenu((v) => (v === item.menu ? null : item.menu!));
                }}
                className="flex items-center gap-1.5 text-lg font-medium text-chip transition-colors hover:text-white"
                aria-haspopup={item.menu ? "true" : undefined}
                aria-expanded={item.menu ? openMenu === item.menu : undefined}
              >
                {item.label}
                {item.menu && <CaretDown size={18} />}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label="Search"
            className="flex items-center gap-1.5 text-lg font-medium text-chip transition-colors hover:text-white"
          >
            <MagnifyingGlass size={18} />
            Search
          </button>
          <a
            href="tel:+14236485200"
            className="figure flex items-center gap-1.5 text-lg text-white"
          >
            <Phone size={22} weight="fill" />
            423.648.5200
          </a>
        </div>

        {/* Solid black — not the glass bg-white/8+blur treatment used
            elsewhere on dark bands. Over hero specifically, that blur let
            the scaling background video show through and fight with the
            dropdown's own text for attention; solid black reads cleanly
            over anything behind it, video included. */}
        {openMenu === "industries" && (
          <div className="absolute left-6 right-6 top-full z-50 border border-white/10 bg-black p-8 sm:left-10 sm:right-10 xl:left-16 xl:right-16">
            <span className="figure mb-6 block text-[11px] uppercase tracking-[0.14em] text-white/50">
              Industries
            </span>
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {industries.map((ind) => {
                const Icon = INDUSTRY_ICONS[ind.slug] ?? Rows;
                return (
                  <li key={ind.slug}>
                    <a
                      href={`?application=${ind.slug}#machine-finder`}
                      onClick={() => setOpenMenu(null)}
                      className="group flex flex-col gap-3 border border-transparent p-4 transition-colors hover:border-white/10 hover:bg-white/8"
                    >
                      <Icon size={24} weight="bold" className="text-brand-red" />
                      <span className="font-display text-lg font-semibold uppercase leading-[1.1] text-white transition-colors group-hover:text-chip">
                        {ind.title.replace("\n", " ")}
                      </span>
                      <span className="figure text-xs text-white/50">
                        {ind.machineCount} MACHINES
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            {/* Real button, not an underlined link — matches the filled
                bg-chip CTA convention used everywhere else on the site. */}
            <a
              href="#industries"
              onClick={() => setOpenMenu(null)}
              className="mt-8 flex h-11 w-fit items-center justify-center gap-1.5 bg-chip px-4 text-sm font-semibold text-black transition-colors hover:bg-white"
            >
              Talk to an engineer
              <CaretRight size={16} weight="bold" />
            </a>
          </div>
        )}

        {openMenu === "machines" && (
          <div className="absolute left-6 right-6 top-full z-50 border border-white/10 bg-black p-8 sm:left-10 sm:right-10 xl:left-16 xl:right-16">
            <span className="figure mb-6 block text-[11px] uppercase tracking-[0.14em] text-white/50">
              Machines
            </span>
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {machineCategories.map((category) => {
                const Icon = MACHINE_ICONS[category] ?? Rows;
                return (
                  <li key={category}>
                    <a
                      href="#machine-finder"
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center gap-3 border border-transparent p-4 text-base text-white/80 transition-colors hover:border-white/10 hover:bg-white/8 hover:text-white"
                    >
                      <Icon size={20} weight="bold" className="shrink-0 text-brand-red" />
                      {category}
                    </a>
                  </li>
                );
              })}
            </ul>
            <a
              href="#machine-finder"
              onClick={() => setOpenMenu(null)}
              className="mt-8 flex h-11 w-fit items-center justify-center gap-1.5 bg-chip px-4 text-sm font-semibold text-black transition-colors hover:bg-white"
            >
              View all 21 machines
              <CaretRight size={16} weight="bold" />
            </a>
          </div>
        )}
      </div>

      <AnimatePresence>
        {mobileOpen && (
        <motion.div
          id="mobile-nav"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.32, ease: [0.4, 0, 0.2, 1] }
          }
          className="fixed inset-x-0 top-0 z-50 flex h-svh flex-col overflow-y-auto bg-black lg:hidden"
        >
          <div className="flex items-center justify-between px-6 py-5">
            <Link href="/" className="flex flex-col gap-1" onClick={() => setMobileOpen(false)}>
              <Image
                src="/assets/haskologo-header.svg"
                alt="Hasko"
                width={110}
                height={25}
              />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="flex size-11 items-center justify-center text-white"
            >
              <X size={26} />
            </button>
          </div>

          <nav aria-label="Primary" className="flex flex-1 flex-col px-2">
            {NAV_LINKS.map((item) =>
              item.menu ? (
                <div key={item.label} className="border-b border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu((v) => (v === item.menu ? null : item.menu!))
                    }
                    aria-expanded={openMenu === item.menu}
                    className="flex h-12 w-full items-center justify-between px-4 text-lg font-medium text-white"
                  >
                    {item.label}
                    <CaretDown
                      size={18}
                      className={`transition-transform ${
                        openMenu === item.menu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openMenu === item.menu && (
                    <div className="flex flex-col gap-1 px-4 pb-4">
                      {item.menu === "industries" &&
                        industries.map((ind) => {
                          const Icon = INDUSTRY_ICONS[ind.slug] ?? Rows;
                          return (
                            <a
                              key={ind.slug}
                              href={`?application=${ind.slug}#machine-finder`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 py-2.5 text-base text-white/80"
                            >
                              <Icon size={20} weight="bold" className="shrink-0 text-brand-red" />
                              <span className="flex-1">{ind.title.replace("\n", " ")}</span>
                              <span className="figure shrink-0 text-xs text-white/50">
                                {ind.machineCount} MACHINES
                              </span>
                            </a>
                          );
                        })}
                      {item.menu === "machines" && (
                        <>
                          {machineCategories.map((category) => {
                            const Icon = MACHINE_ICONS[category] ?? Rows;
                            return (
                              <a
                                key={category}
                                href="#machine-finder"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 py-2.5 text-base text-white/80"
                              >
                                <Icon size={20} weight="bold" className="shrink-0 text-brand-red" />
                                {category}
                              </a>
                            );
                          })}
                          <a
                            href="#machine-finder"
                            onClick={() => setMobileOpen(false)}
                            className="mt-2 py-2.5 text-base font-medium text-chip"
                          >
                            View all 21 machines &rarr;
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex h-12 items-center border-b border-white/10 px-4 text-lg font-medium text-white"
                >
                  {item.label}
                </Link>
              ),
            )}
            <a
              href="tel:+14236485200"
              className="figure flex h-12 items-center gap-2 border-b border-white/10 px-4 text-base text-white"
            >
              <Phone size={20} weight="fill" />
              423.648.5200
            </a>
          </nav>

          <div className="p-4">
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="flex h-12 items-center justify-center bg-chip text-base font-semibold text-black"
            >
              Request a Quote
            </a>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
