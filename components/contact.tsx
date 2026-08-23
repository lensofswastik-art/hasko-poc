import Image from "next/image";
import { CaretRight, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";

// CLAUDE.md §6, section 11 — route selector cards, verbatim.
const ROUTES = [
  {
    label: "I am looking at a machine",
    detail: "Sales · Steve Pugh, VP",
    href: "tel:+14236485200",
  },
  {
    label: "I need a part or service",
    detail: "Parts · 423.225.5763",
    href: "tel:+14232255763",
  },
  {
    label: "I have a technical question",
    detail: "Engineering · Robert Hall",
    href: "tel:+14236485200",
  },
] as const;

// "Every named contact gets a mailto: — the current site has zero."
const PEOPLE = [
  {
    name: "Steve Pugh",
    role: "VP Sales",
    phone: "423.648.5200",
    tel: "tel:+14236485200",
    email: "spugh@haskomachines.com",
  },
  {
    name: "Robert Hall",
    role: "Engineering Director",
    phone: "423.648.5200",
    tel: "tel:+14236485200",
    email: "rhall@haskomachines.com",
  },
  {
    name: "Joey Walker",
    role: "Operations Director",
    phone: "423.648.5200",
    tel: "tel:+14236485200",
    email: "jwalker@haskomachines.com",
  },
] as const;

export function Contact() {
  return (
    <section id="contact" className="relative bg-black pb-10 pt-16 sm:pb-12 sm:pt-20 md:pt-28">
      <div className="px-6 sm:px-10 xl:px-16">
        
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <h2 className="font-display text-3xl font-semibold uppercase leading-[1.05] text-white sm:text-5xl">
                Who do you need?
              </h2>

              <div className="flex flex-col gap-1 text-white/85">
                <p className="text-lg leading-none sm:leading-relaxed">HASKO Inc.</p>
                <p className="text-lg leading-none sm:leading-relaxed">
                  Soddy-Daisy, Tennessee
                </p>
                <a
                  href="tel:+14236485200"
                  className="figure mt-2 flex w-fit items-center gap-2 text-lg text-white underline decoration-white/30 decoration-1 underline-offset-4 transition-colors hover:text-chip"
                >
                  <Phone size={18} weight="fill" />
                  423.648.5200
                  <span className="font-sans text-sm normal-case text-white/50">
                    main office
                  </span>
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {ROUTES.map((route) => (
                <a
                  key={route.label}
                  href={route.href}
                  className="flex flex-col gap-2 border border-white/30 bg-white/8 p-6 backdrop-blur-[50px] transition-colors hover:bg-white/12"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-lg font-medium text-white">
                      {route.label}
                    </span>
                    <CaretRight size={20} className="shrink-0 text-white/50" />
                  </div>
                  <span className="figure text-sm uppercase tracking-[0.08em] text-white/50">
                    {route.detail}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {/* Embedded map — not two bulleted lists of driving directions. */}
            <div className="relative h-[280px] w-full overflow-hidden bg-white/8 sm:h-[340px]">
              <iframe
                title="HASKO Inc. — Soddy-Daisy, Tennessee"
                src="https://www.google.com/maps?q=Soddy-Daisy,+Tennessee&output=embed"
                className="h-full w-full grayscale invert-[92%] contrast-[90%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-0 flex items-start p-4">
                <span className="figure flex items-center gap-1.5 bg-black/70 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-white/70">
                  <MapPin size={14} />
                  Soddy-Daisy, TN
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <span className="figure text-[11px] uppercase tracking-[0.14em] text-white/50">
                Who you will talk to
              </span>

              <div className="flex flex-col divide-y divide-white/10 border-t border-white/10">
                {PEOPLE.map((person) => (
                  <div
                    key={person.name}
                    className="flex items-center gap-4 py-5 sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative size-16 shrink-0 overflow-hidden border border-brand-red sm:size-20">
                        <Image
                          src="/assets/testimonials/roger-isaacs.jpg"
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-display text-xl font-semibold uppercase leading-none text-white">
                          {person.name}
                        </p>
                        <p className="text-base text-white/60">{person.role}</p>
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-4 sm:ml-0">
                      <a
                        href={person.tel}
                        className="figure text-sm text-white underline decoration-white/30 decoration-1 underline-offset-4 transition-colors hover:text-chip"
                      >
                        direct
                      </a>
                      <a
                        href={`mailto:${person.email}`}
                        className="flex items-center gap-1.5 text-sm text-white underline decoration-white/30 decoration-1 underline-offset-4 transition-colors hover:text-chip"
                      >
                        <EnvelopeSimple size={16} />
                        email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
