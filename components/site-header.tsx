"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CaretDown,
  List,
  MagnifyingGlass,
  Phone,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { industries } from "@/lib/machines";
import { AnnouncementBar } from "./announcement-bar";

const NAV_LINKS = [
  { label: "Industries", href: "#industries", menu: "industries" as const },
  { label: "Machines", href: "#machine-finder", menu: "machines" as const },
  { label: "Automation", href: "#automation" },
  { label: "Parts & Service", href: "#parts-service" },
  { label: "About", href: "#why-heavy-built" },
];

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

      {/* Row 2: primary nav, divided from row 1 by a hairline */}
      <div className="mt-6 hidden items-center justify-between border-t border-line px-6 pb-6 pt-5 sm:px-10 xl:px-16 lg:flex">
        <nav className="flex items-center gap-8" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.menu && setOpenMenu(item.menu)}
              onMouseLeave={() => item.menu && setOpenMenu(null)}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1.5 text-lg font-medium text-chip transition-colors hover:text-white"
                aria-haspopup={item.menu ? "true" : undefined}
                aria-expanded={item.menu ? openMenu === item.menu : undefined}
              >
                {item.label}
                {item.menu && <CaretDown size={18} />}
              </Link>

              {item.menu === "industries" && openMenu === "industries" && (
                <div className="absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 rounded-b-lg border border-white/10 bg-black p-4 shadow-2xl">
                  <ul className="grid grid-cols-2 gap-2">
                    {industries.map((ind) => (
                      <li key={ind.slug}>
                        <a
                          href={`?application=${ind.slug}#machine-finder`}
                          className="block rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                        >
                          {ind.title.replace("\n", " ")}
                          <span className="figure ml-2 text-xs text-white/50">
                            {ind.machineCount} MACHINES
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.menu === "machines" && openMenu === "machines" && (
                <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 rounded-b-lg border border-white/10 bg-black p-4 shadow-2xl">
                  <a
                    href="#machine-finder"
                    className="block rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    View all 21 machines →
                  </a>
                </div>
              )}
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
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex h-12 items-center border-b border-white/10 px-4 text-lg font-medium text-white"
              >
                {item.label}
              </Link>
            ))}
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
