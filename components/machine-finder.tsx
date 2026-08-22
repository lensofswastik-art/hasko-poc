"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CaretDown, CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { filterGroups, filterMachines, machines, type ActiveFilters } from "@/lib/machines";
import { MachineCard } from "./machine-card";
import { FilterBottomSheet } from "./filter-bottom-sheet";

const PAGE_SIZE = 3;

export function MachineFinder() {
  const searchParams = useSearchParams();
  const initialApplication = searchParams.get("application");
  // Both the native <select> and the sheet-trigger button render at every
  // width; Tailwind's sm: breakpoint decides which is visible (matching the
  // mobile/desktop nav split in site-header.tsx) rather than a JS viewport
  // check — no hydration flash, no client-only render pass to wait out.
  const [openSheet, setOpenSheet] = useState<keyof Omit<ActiveFilters, "q"> | null>(
    null,
  );

  const [filters, setFilters] = useState<ActiveFilters>({
    application: initialApplication,
    process: null,
    materialWidth: null,
    horsepower: null,
    q: "",
  });
  const [page, setPage] = useState(0);

  const results = useMemo(() => filterMachines(filters), [filters]);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = results.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  function updateFilter<K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(0);
  }

  return (
    <section id="machine-finder" className="bg-black pb-20 pt-16 md:pb-28 md:pt-20">
      <h2 className="font-display mx-auto max-w-3xl px-6 text-center text-3xl font-semibold uppercase leading-[1.05] text-white sm:px-10 sm:text-5xl">
        Find the machine that fits your line
      </h2>

      {/* Full-bleed, edge to edge — per Figma (node 299:872 sits at x:-1 width:1441
          inside a 1440 frame, deliberately overflowing both edges), unlike the
          padded content below it. */}
      {/* Mobile: a 2-col grid — max-sm:border-l/-t on individual cells draws
          the internal grid lines by column/row position, since divide-y (a
          single-column stack tool) would put a border-top on the top-right
          cell too, a false line along the grid's own top edge. Desktop drops
          the grid for the original single-row flex layout, where divide-x
          already draws the right dividers on its own. */}
      <div className="mt-10 grid grid-cols-2 border-y border-line sm:flex sm:flex-row sm:divide-x sm:divide-line">
        {filterGroups.map((group, i) => {
          const selected = group.options.find((o) => o.value === filters[group.key]);
          return (
            <div
              key={group.key}
              className={`flex-1 border-line ${i % 2 === 1 ? "max-sm:border-l" : ""} ${
                i >= 2 ? "max-sm:border-t" : ""
              }`}
            >
              {/* Mobile: opens the bottom sheet below instead of the native
                  OS picker, so it can carry the site's own theme (Geist
                  Mono, --chip selected state) instead of the browser's
                  default control chrome. Desktop keeps the native <select> —
                  no bottom-sheet pattern to match there. */}
              <button
                type="button"
                onClick={() => setOpenSheet(group.key)}
                className="flex h-20 w-full items-center justify-between gap-2 px-5 sm:hidden"
                aria-haspopup="dialog"
              >
                <span
                  className={`figure truncate text-lg uppercase ${
                    selected ? "text-white" : "text-white/50"
                  }`}
                >
                  {selected ? selected.label : group.label}
                </span>
                <CaretDown size={18} className="shrink-0 text-white/60" />
              </button>

              <label className="hidden h-20 items-center justify-between gap-2 px-5 sm:flex">
                <span className="sr-only">{group.label}</span>
                <select
                  value={filters[group.key] ?? ""}
                  onChange={(e) => updateFilter(group.key, e.target.value || null)}
                  className="figure w-full appearance-none bg-transparent text-lg uppercase text-white/50 focus:text-white focus-visible:outline-none sm:text-2xl [&>option]:bg-black [&>option]:text-white"
                  aria-label={group.label}
                >
                  <option value="">{group.label}</option>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className="text-white/60">▾</span>
              </label>
            </div>
          );
        })}

        <label className="col-span-2 flex h-20 items-center gap-2.5 border-line bg-line-soft px-5 max-sm:border-t sm:w-[280px]">
          <MagnifyingGlass size={24} className="shrink-0 text-white/50" />
          <span className="sr-only">Search machines</span>
          <input
            type="search"
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
            placeholder="SEARCH"
            className="figure w-full bg-transparent text-lg uppercase text-white placeholder:text-white/50 focus-visible:outline-none sm:text-2xl"
          />
        </label>
      </div>

      {filterGroups.map((group) => (
        <FilterBottomSheet
          key={group.key}
          open={openSheet === group.key}
          label={group.label}
          options={group.options}
          value={filters[group.key]}
          onApply={(value) => {
            updateFilter(group.key, value);
            setOpenSheet(null);
          }}
          onClose={() => setOpenSheet(null)}
        />
      ))}

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        <p aria-live="polite" className="mt-10 text-lg text-chip">
          SHOWING{" "}
          <span className="text-brand-red">
            {results.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}–
            {Math.min(results.length, currentPage * PAGE_SIZE + PAGE_SIZE)} OF{" "}
            {machines.length}
          </span>{" "}
          MACHINES
        </p>

        {visible.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((machine) => (
              <MachineCard key={machine.slug} machine={machine} />
            ))}
          </div>
        ) : (
          <div className="mt-6 border border-line bg-white/5 p-10 text-center">
            <p className="text-lg text-white">
              No machine matches every filter you&rsquo;ve selected.
            </p>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  application: null,
                  process: null,
                  materialWidth: null,
                  horsepower: null,
                  q: "",
                })
              }
              className="mt-4 bg-chip px-[15px] py-[13px] text-sm font-semibold text-black hover:bg-white"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="mt-16 flex items-center justify-center gap-2.5 sm:justify-end">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex size-20 items-center justify-center border border-line text-white disabled:opacity-30"
          >
            <CaretLeft size={28} />
          </button>
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="flex size-20 items-center justify-center border border-line text-white disabled:opacity-30"
          >
            <CaretRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
}
