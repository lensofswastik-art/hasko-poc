import Image from "next/image";
import type { MachineRecord } from "@/lib/machines";
import { getMachineImage } from "@/lib/machines";

export function MachineCard({ machine }: { machine: MachineRecord }) {
  return (
    <div className="relative flex h-[470px] flex-col bg-white/8 backdrop-blur-[50px]">
      <div className="relative m-2 h-[309px] overflow-hidden bg-surface">
        <Image
          src={getMachineImage(machine)}
          alt={`${machine.name} (${machine.model})`}
          fill
          sizes="424px"
          className="object-cover"
        />
      </div>

      <div className="flex items-end justify-between px-2 pt-2">
        <p className="font-display max-w-[70%] text-xl font-semibold uppercase leading-none text-white sm:text-2xl">
          {machine.name}
        </p>
        <span className="figure text-base text-white">{machine.model}</span>
      </div>

      {/* Capability figure and the View Spec action share one row at the
          card's foot, per Figma (button top:412 overlaps capability
          top:425.5 in the 470px card) — not stacked as separate rows.
          mt-auto (not a fixed gap) anchors this row to the card's bottom
          edge, matching Figma's bottom:10 on the button — a fixed mt-4 left
          this row sitting right under the name row with dead empty space
          below it instead of flush against the floor. */}
      <div className="mt-auto flex items-end justify-between gap-3 px-2 pb-2">
        <p className="figure text-sm text-white sm:text-base">
          {machine.capability}
        </p>

        <a
          href={`/machines/${machine.slug}`}
          className="shrink-0 bg-chip px-[15px] py-[13px] text-sm font-semibold text-black transition-colors hover:bg-white"
        >
          View Spec
        </a>
      </div>
    </div>
  );
}
