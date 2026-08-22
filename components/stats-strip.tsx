const STATS = ["96 YEARS", "25-YEAR SERVICE LIFE", "21 MACHINES"];

export function StatsStrip() {
  return (
    <div className="flex h-20 items-center overflow-hidden border-b border-line bg-black">
      {/* Mobile: three stats never sit comfortably on one line without
          shrinking the mono figures past readable, so they run as a
          continuous marquee instead of wrapping onto a cramped second row.
          Desktop has the room — plain spread, no motion to name. */}
      <div className="flex w-full overflow-hidden sm:hidden">
        {/* Animated element is unconstrained (no w-full) so its own width is
            exactly "2x one rep" — translateX(-50%) is a percentage of THAT
            width, not the visible viewport, which is what makes the loop
            seam land exactly on the repeat rather than at an arbitrary
            fraction of the container. */}
        <div className="figure flex shrink-0 animate-[marquee_22s_linear_infinite] items-center gap-16 whitespace-nowrap pl-6 text-lg text-white motion-reduce:animate-none">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex shrink-0 items-center gap-16" aria-hidden={rep === 1}>
              {STATS.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="figure mx-auto hidden w-full max-w-[1440px] items-center justify-between gap-4 px-6 text-lg text-white sm:flex sm:px-10 sm:text-2xl">
        {STATS.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  );
}
