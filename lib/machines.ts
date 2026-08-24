import raw from "@/machines.json";

export type MachineSpecs = {
  material_width: string | null;
  material_thickness: string | null;
  minimum_length: string | null;
  arbor_hp: string | null;
  saw_diameter: string | null;
  feed_rate: string | null;
  feed_drive: string | null;
  footprint: string | null;
  weight: string | null;
  power: string | null;
};

export type MachineRecord = {
  model: string;
  name: string;
  slug: string;
  category: string;
  process: string[];
  applications: string[];
  description: string;
  capability: string;
  image: string;
  specs: MachineSpecs;
  _status: "verified" | "placeholder";
};

export type MachinesData = {
  machines: MachineRecord[];
  _filters: {
    application: string[];
    process: string[];
    materialWidth: string[];
    horsepower: string[];
  };
  _categories: string[];
};

const data = raw as unknown as MachinesData;

export const machines: MachineRecord[] = data.machines;

export function getMachineBySlug(slug: string): MachineRecord | undefined {
  return machines.find((m) => m.slug === slug);
}

const APPLICATION_LABELS: Record<string, string> = {
  flooring: "Flooring",
  "ripped-products": "Ripped products",
  "dimensional-wood": "Dimensional wood",
  moulding: "Moulding",
};

const PROCESS_LABELS: Record<string, string> = {
  ripping: "Ripping",
  chopping: "Chopping",
  matching: "Matching",
  planing: "Planing",
  scanning: "Scanning",
  feeding: "Feeding",
  "material-handling": "Material handling",
};

const WIDTH_LABELS: Record<string, string> = {
  "<12": '< 12"',
  "12-24": '12–24"',
  "24-36": '24–36"',
  "36+": '36"+',
};

const HP_LABELS: Record<string, string> = {
  "<50": "< 50",
  "50-100": "50–100",
  "100-150": "100–150",
  "150+": "150+",
};

export type FilterOption = { value: string; label: string };

export const filterGroups: {
  key: "application" | "process" | "materialWidth" | "horsepower";
  label: string;
  options: FilterOption[];
}[] = [
  {
    key: "application",
    label: "Application",
    options: data._filters.application.map((v) => ({
      value: v,
      label: APPLICATION_LABELS[v] ?? v,
    })),
  },
  {
    key: "process",
    label: "Process",
    options: data._filters.process.map((v) => ({
      value: v,
      label: PROCESS_LABELS[v] ?? v,
    })),
  },
  {
    key: "materialWidth",
    label: "Width",
    options: data._filters.materialWidth.map((v) => ({
      value: v,
      label: WIDTH_LABELS[v] ?? v,
    })),
  },
  {
    key: "horsepower",
    label: "HP",
    options: data._filters.horsepower.map((v) => ({
      value: v,
      label: HP_LABELS[v] ?? v,
    })),
  },
];

export type ActiveFilters = {
  application: string | null;
  process: string | null;
  materialWidth: string | null;
  horsepower: string | null;
  q: string;
};

/**
 * Placeholder machines don't carry a real material_width/arbor_hp, so width/HP
 * filters can only ever match the one verified machine (SR Series) today.
 * That's a data-completeness fact, not a filtering bug — see machines.json's
 * own _status flags.
 */
function widthMatches(spec: string | null, bucket: string): boolean {
  if (!spec) return false;
  const widths = [...spec.matchAll(/(\d+)"/g)].map((m) => Number(m[1]));
  if (!widths.length) return false;
  const max = Math.max(...widths);
  switch (bucket) {
    case "<12":
      return max < 12;
    case "12-24":
      return max >= 12 && max <= 24;
    case "24-36":
      return max > 24 && max <= 36;
    case "36+":
      return max > 36;
    default:
      return false;
  }
}

function hpMatches(spec: string | null, bucket: string): boolean {
  if (!spec) return false;
  const hps = [...spec.matchAll(/(\d+)\s*HP/gi)].map((m) => Number(m[1]));
  if (!hps.length) return false;
  const max = Math.max(...hps);
  switch (bucket) {
    case "<50":
      return max < 50;
    case "50-100":
      return max >= 50 && max <= 100;
    case "100-150":
      return max > 100 && max <= 150;
    case "150+":
      return max > 150;
    default:
      return false;
  }
}

export function filterMachines(
  filters: ActiveFilters,
  list: MachineRecord[] = machines,
): MachineRecord[] {
  const q = filters.q.trim().toLowerCase();
  return list.filter((m) => {
    if (filters.application && !m.applications.includes(filters.application))
      return false;
    if (filters.process && !m.process.includes(filters.process))
      return false;
    if (
      filters.materialWidth &&
      !widthMatches(m.specs.material_width, filters.materialWidth)
    )
      return false;
    if (filters.horsepower && !hpMatches(m.specs.arbor_hp, filters.horsepower))
      return false;
    if (
      q &&
      !`${m.name} ${m.model} ${m.description}`.toLowerCase().includes(q)
    )
      return false;
    return true;
  });
}

export const industries = [
  {
    slug: "flooring",
    title: "Solid & engineered\nflooring",
    // Real copy, not Figma's lorem ipsum placeholder (node 299:860) — this
    // is the same description CLAUDE.md's section 03 table specifies.
    description:
      "End matchers, side matchers, pre-surfacers and truck flooring lines.",
    machineCount: 7,
    figure: "400 FPM",
    image: "/assets/industries/flooring.png",
  },
  {
    slug: "ripped-products",
    title: "Ripped products\n& rough mill",
    description:
      "Gang ripsaws, scan/rip lines and strip saws built to lift yield.",
    machineCount: 6,
    figure: "7,000 BF/HR",
    image: "/assets/industries/ripped-products.png",
  },
  {
    slug: "dimensional-wood",
    title: "Dimensional wood,\nfurn. & cabinetry",
    description:
      "Chopping, defect scanning and optimisation for components.",
    machineCount: 5,
    figure: "SCAN-DRIVEN",
    image: "/assets/industries/dimensional-wood.png",
  },
  {
    slug: "moulding",
    title: "Moulding\n& panelling",
    description:
      "Matchers, planers and surfacers for architectural profiles.",
    machineCount: 3,
    figure: "HVY ARBORS",
    image: "/assets/industries/moulding.png",
  },
] as const;

// The site's own machine-category taxonomy (CLAUDE.md §6 header spec:
// "Machines mega-menu: 12 categories in three columns"), shared between the
// header mega-menu and the footer's Machines column so both list the same
// names instead of two hand-maintained copies drifting apart.
export const machineCategories = [
  "Board ripping",
  "End matching",
  "Side matching",
  "Planing",
  "Chopping",
  "Scanning",
  "Feeding systems",
  "Material handling",
  "Special machines",
  "Used machinery",
];

export const featuredMachineImages: Record<string, string> = {
  "gang-ripsaw": "/assets/machines/gang-ripsaw.png",
  endmatcher: "/assets/machines/end-matcher.png",
  "stripmaster-pre-surfacer": "/assets/machines/stripmaster.png",
};

const STAND_IN_IMAGES = Object.values(featuredMachineImages);

/**
 * Only 3 of the 21 real machines have a photo shot for them. Per CLAUDE.md
 * §4 ("If all 21 machines cannot be reshot, use one consistent silhouette
 * treatment ... Consistency beats fidelity here"), the other 18 borrow one
 * of those 3 real photos as a stand-in rather than rendering an empty
 * placeholder tile — a deliberate, explicitly-authorized substitution, not
 * an invented spec. The stand-in choice is a stable hash of the slug (not
 * random, not index-based) so the same machine always gets the same
 * stand-in across renders/filters. Every card carrying a stand-in still
 * shows the "Placeholder" badge via the machine's own `_status` field —
 * that badge already covers "this card's content isn't final," image
 * included, so no separate photo-specific disclaimer is needed.
 */
export function getMachineImage(machine: MachineRecord): string {
  const own = featuredMachineImages[machine.slug];
  if (own) return own;
  let hash = 0;
  for (let i = 0; i < machine.slug.length; i++) {
    hash = (hash * 31 + machine.slug.charCodeAt(i)) >>> 0;
  }
  return STAND_IN_IMAGES[hash % STAND_IN_IMAGES.length];
}
