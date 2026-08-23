"use client";

import { useState } from "react";
import { CaretRight, Phone, Plus } from "@phosphor-icons/react/dist/ssr";

// CLAUDE.md §11: "Demo populates three machines with real data and labels
// it as a sample." These are the same three the rest of the build already
// has real photos/specs for — no new placeholder machines invented here.
const SAMPLE_MACHINES = [
  { slug: "gang-ripsaw", name: "Gang Ripsaw", model: "SR-36" },
  { slug: "endmatcher", name: "EndMatcher", model: "MPEM-C" },
  { slug: "stripmaster-pre-surfacer", name: "StripMaster Pre-Surfacer", model: "FSP-EF" },
] as const;

// No real PDFs exist behind these — sizes are plausible placeholders, not
// measurements of an actual file, so every row carries the same "Sample
// data" flag as the panel it lives in rather than implying it's real.
const DOCUMENTS = [
  { label: "Parts list", size: "2.4 MB" },
  { label: "Operator manual", size: "8.1 MB" },
  { label: "Exploded diagram", size: "1.2 MB" },
] as const;

const BENEFITS = [
  "Same-day quotes on stocked parts",
  "Field service and install support",
  "Retrofits and upgrades for machines already in-plant",
];

export function PartsService() {
  const [selected, setSelected] = useState<(typeof SAMPLE_MACHINES)[number] | null>(null);
  const [serial, setSerial] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const machine = submitted ? selected : null;

  return (
    <section id="parts-service" className="relative overflow-hidden bg-brand-red">
      {/* blueprint grid texture — tiled at native size, not `object-cover`
          stretched, so the lines line up with the same tile in proof.tsx
          and why-heavy-built.tsx instead of each section showing a
          differently-scaled crop of the artwork. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[length:1440px_820px] bg-top bg-repeat opacity-90"
        style={{ backgroundImage: "url(/assets/hero-bg-grid.svg)" }}
        aria-hidden="true"
      />

      <div className="relative px-6 py-20 sm:px-10 md:py-28 xl:px-16">

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start md:gap-16">
          {/* Card first in DOM (mobile: headline reads before the tool,
              matching every other section's H2-before-interaction order),
              reordered to the left on desktop per the wireframe. */}
          <div className="order-2 bg-black p-6 sm:p-9 md:order-1">
            {!submitted ? (
              <form
                className="flex flex-col gap-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selected) setSubmitted(true);
                }}
              >
                <div className="flex flex-col gap-3">
                  <span className="figure text-[11px] uppercase tracking-[0.14em] text-muted">
                    Step 1
                  </span>
                  <label className="flex flex-col gap-2">
                    <span className="text-base font-medium text-white">Machine model</span>
                    <select
                      required
                      value={selected?.slug ?? ""}
                      onChange={(e) =>
                        setSelected(
                          SAMPLE_MACHINES.find((m) => m.slug === e.target.value) ?? null,
                        )
                      }
                      className="h-14 border border-white/30 bg-black px-4 text-base text-white focus-visible:outline-none [&>option]:bg-black"
                    >
                      <option value="" disabled>
                        Select a machine
                      </option>
                      {SAMPLE_MACHINES.map((m) => (
                        <option key={m.slug} value={m.slug}>
                          {m.name} ({m.model})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="figure text-[11px] uppercase tracking-[0.14em] text-muted">
                    Step 2 &middot; optional
                  </span>
                  <label className="flex flex-col gap-2">
                    <span className="text-base font-medium text-white">Serial number</span>
                    <input
                      type="text"
                      value={serial}
                      onChange={(e) => setSerial(e.target.value)}
                      placeholder="e.g. SR36-1042"
                      className="figure h-14 border border-white/30 bg-black px-4 text-base text-white placeholder:text-muted focus-visible:outline-none"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!selected}
                  className="flex h-14 items-center justify-center gap-1.5 bg-chip text-base font-semibold text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Find parts
                  <CaretRight size={18} weight="bold" />
                </button>
              </form>
            ) : (
              machine && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="figure text-base uppercase text-white">
                      {machine.model} {machine.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-base text-body underline decoration-white/30 decoration-1 underline-offset-4 transition-colors hover:text-white"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex flex-col">
                    <span className="figure mb-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                      Sample data
                    </span>
                    {DOCUMENTS.map((doc) => (
                      <a
                        key={doc.label}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="flex h-14 items-center justify-between gap-4 border-t border-white/30 text-base text-white transition-colors last:border-b hover:text-white"
                      >
                        <span>{doc.label}</span>
                        <span className="figure flex items-center gap-2 text-sm text-muted">
                          PDF &middot; {doc.size}
                          <CaretRight size={16} />
                        </span>
                      </a>
                    ))}
                  </div>

                  <a
                    href="#contact"
                    className="flex h-14 items-center justify-center bg-chip text-base font-semibold text-black transition-colors hover:bg-white"
                  >
                    Request a part
                  </a>

                  <a
                    href="tel:+14232255763"
                    className="flex h-11 items-center justify-center gap-2 border border-white/30 bg-white/12 text-base text-white transition-colors hover:bg-white/20"
                  >
                    <Phone size={18} weight="fill" />
                    <span className="figure">423.225.5763</span>
                  </a>
                </div>
              )
            )}
          </div>

          <div className="order-1 flex flex-col gap-6 md:order-2">
            <h2 className="font-display max-w-xl text-3xl font-semibold uppercase leading-[1.05] text-white sm:text-5xl">
              Your machine is 20 years old. We still have the drawings.
            </h2>
            <p className="max-w-lg text-lg leading-none sm:leading-relaxed text-white/85">
              Hasko keeps the model, serial number, parts list, drawings and
              configuration for every machine we have built, for its whole
              service life. Find what you need without waiting on a call.
            </p>
            <ul className="flex flex-col gap-4">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-base text-white/85">
                  <Plus size={18} weight="bold" className="mt-0.5 shrink-0 text-ink" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
