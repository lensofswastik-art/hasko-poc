"use client";

import Image from "next/image";
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { machineCategories } from "@/lib/machines";

// CLAUDE.md §6, section 12 — footer nav, verbatim. Closes 3.8 (no footer
// navigation at all on the current site) and 3.1 (dead Google+ link —
// there is deliberately no Google+ icon here; see the "NO GOOGLE+" note
// in the bottom bar instead of silently omitting the finding).
const INDUSTRIES = ["Flooring", "Ripped products", "Dimensional wood", "Moulding"];

const COMPANY = ["About Hasko", "Careers", "News", "Contract manufacturing"];

const SUPPORT = ["Parts & Service", "Request a quote", "Resources", "Contact"];

const SOCIAL = [
  { label: "LinkedIn", Icon: LinkedinLogo, href: "#" },
  { label: "Instagram", Icon: InstagramLogo, href: "#" },
  { label: "Facebook", Icon: FacebookLogo, href: "#" },
  { label: "YouTube", Icon: YoutubeLogo, href: "#" },
] as const;

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="figure text-[11px] uppercase tracking-[0.14em] text-white/50">
        {title}
      </span>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-base text-white/85 underline decoration-white/20 decoration-1 underline-offset-4 transition-colors hover:text-chip hover:decoration-chip"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="px-6 pb-16 pt-10 sm:px-10 sm:pb-20 sm:pt-12 xl:px-16">
        <div className="flex flex-col gap-4">
          <div className="relative h-[30px] w-[133px]">
            <Image src="/assets/haskologo-header.svg" alt="Hasko" fill />
          </div>
          <span className="figure text-sm uppercase tracking-[0.08em] text-white/50">
            Heavy-built performance &middot; Since 1930
          </span>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 md:mt-16">
          <FooterColumn title="Machines" links={machineCategories} />
          <FooterColumn title="Industries" links={INDUSTRIES} />
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Support" links={SUPPORT} />
        </div>

        <a
          href="#machine-finder"
          className="mt-10 flex h-12 w-fit items-center justify-center gap-1.5 bg-chip px-4 text-base font-semibold text-black transition-colors hover:bg-white"
        >
          View all 21 machines &rarr;
        </a>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between md:mt-20">
          <div className="figure flex flex-col gap-2 text-sm text-white/50 sm:flex-row sm:items-center sm:gap-4">
            <span>HASKO Inc.</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>Soddy-Daisy, TN</span>
            <span className="hidden sm:inline">&middot;</span>
            <a href="tel:+14236485200" className="text-white hover:text-chip">
              423.648.5200
            </a>
            <span className="hidden sm:inline">&middot;</span>
            <a href="mailto:hello@haskomachines.com" className="text-white hover:text-chip">
              hello@haskomachines.com
            </a>
          </div>

          <div className="flex items-center gap-5">
            {SOCIAL.map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => e.preventDefault()}
                aria-label={label}
                className="text-white/50 transition-colors hover:text-chip"
              >
                <Icon size={20} />
              </a>
            ))}
            {/* Audit 3.1: the current site links to Google+, dead since
                April 2019. This label replaces it rather than silently
                dropping the finding — the fix is documented, not hidden. */}
            <span className="figure text-xs uppercase tracking-[0.08em] text-white/30">
              No Google+
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span>&copy; 2026 HASKO Inc.</span>
            {/* Build credit — folded into the existing copyright row rather
                than its own section, so it doesn't add footer height. The
                GIF is a real animated asset (1432x1432, ~6.4MB) that Next's
                Image optimizer can't re-encode without losing the
                animation, so it's a plain <img>, lazy-loaded since it's the
                very last element on the page. Sized up from an earlier pass
                (20px) to 32px — at 20px the mascot's detail was unreadable. */}
            <span className="hidden text-white/20 sm:inline">&middot;</span>
            <span className="figure flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em] text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/HD%20Mascot.gif"
                alt=""
                width={32}
                height={32}
                loading="lazy"
                className="size-8 shrink-0"
              />
              Handcrafted by{" "}
              {/* The only blue anywhere on the site — deliberately outside
                  Hasko's own red/neutral system (CLAUDE.md bans blue for
                  the brand UI), since this is a third-party attribution
                  link, not a Hasko interface element. #4C8DFF is close to a
                  standard "external link" blue at a comfortable contrast on
                  black; not a design-system token, this one line is the
                  named exception. */}
              <a
                href="https://happening.design"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4C8DFF] underline decoration-[#4C8DFF]/40 decoration-1 underline-offset-4 transition-colors hover:text-[#7BA9FF]"
              >
                Happening
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="underline decoration-white/20 decoration-1 underline-offset-4 transition-colors hover:text-chip hover:decoration-chip"
            >
              Privacy
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="underline decoration-white/20 decoration-1 underline-offset-4 transition-colors hover:text-chip hover:decoration-chip"
            >
              Accessibility statement
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
