import { CalendarDots, MapPin, Storefront } from "@phosphor-icons/react/dist/ssr";

const IS_EVENT_LIVE = true;

/**
 * The IWF widget. Two layouts, one component:
 * - `full` (mobile/tablet): its own full-width strip above the logo/hamburger
 *   row — there's no room to center a compact widget once the header row
 *   only has two other items (logo, hamburger), so it spreads edge to edge
 *   instead of clipping.
 * - default (desktop, lg+): the compact, content-width block centered in
 *   SiteHeader's top row, per Figma.
 */
export function AnnouncementBar({ full = false }: { full?: boolean }) {
  if (!IS_EVENT_LIVE) return null;

  return (
    <div
      className={
        full
          ? "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-black px-6 py-2.5 text-xs text-chip sm:px-10 sm:text-sm"
          : "flex items-center gap-2.5 whitespace-nowrap bg-black py-1.5 pl-4 pr-1.5 text-sm text-chip sm:gap-6 sm:text-base"
      }
    >
      <div className={full ? "flex items-center gap-3" : "contents"}>
        {/* <span>
          <img src="/iwf.png" alt="IWF 2026" className="h-10 w-auto" />
        </span> */}
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <Storefront size={16} weight="fill" className="shrink-0" />
          Booth 102
        </span>
        <span
          className={`items-center gap-1.5 whitespace-nowrap ${full ? "hidden min-[420px]:flex" : "hidden sm:flex"}`}
        >
          <MapPin size={16} weight="fill" className="shrink-0" />
          Georgia World
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <CalendarDots size={16} weight="fill" className="shrink-0" />
          25 - 28 Aug
        </span>
      </div>
      <a
        href="#contact"
        className={
          full
            ? "flex h-9 shrink-0 items-center bg-chip px-3 text-xs font-semibold text-black transition-colors hover:bg-white sm:h-10 sm:px-4 sm:text-sm"
            : "flex h-12 items-center bg-chip px-[15px] text-sm font-semibold text-black transition-colors hover:bg-white"
        }
      >
        Book a Meeting
      </a>
    </div>
  );
}
