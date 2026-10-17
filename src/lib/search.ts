import { SECTION_KEYS } from "./format";

export type HallSearch = {
  city?: string;
  section?: "BOTH" | "MEN" | "WOMEN";
  capacity?: number;
  maxPrice?: number;
  sort: "newest" | "price_asc" | "price_desc" | "capacity";
};

type Raw = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function positiveInt(v: string | string[] | undefined): number | undefined {
  const s = one(v);
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function parseHallSearch(raw: Raw): HallSearch {
  const section = one(raw.section);
  const sort = one(raw.sort);
  return {
    city: one(raw.city)?.trim() || undefined,
    section: (SECTION_KEYS as readonly string[]).includes(section ?? "") ? (section as HallSearch["section"]) : undefined,
    capacity: positiveInt(raw.capacity),
    maxPrice: positiveInt(raw.maxPrice),
    sort: sort === "price_asc" || sort === "price_desc" || sort === "capacity" ? sort : "newest",
  };
}

export type SearchableHall = {
  city: string;
  section: string;
  capacityMen: number;
  capacityWomen: number;
  basePrice: number;
};

function relevantCapacity(h: SearchableHall, section: HallSearch["section"]): number {
  if (section === "MEN") return h.capacityMen;
  if (section === "WOMEN") return h.capacityWomen;
  return Math.max(h.capacityMen, h.capacityWomen, h.capacityMen + h.capacityWomen);
}

export function matchesHall(h: SearchableHall, s: HallSearch): boolean {
  if (s.city && h.city !== s.city) return false;
  if (s.maxPrice && h.basePrice > s.maxPrice) return false;
  if (s.section === "MEN" && h.capacityMen <= 0) return false;
  if (s.section === "WOMEN" && h.capacityWomen <= 0) return false;
  if (s.section === "BOTH" && h.section !== "BOTH") return false;
  if (s.capacity && relevantCapacity(h, s.section) < s.capacity) return false;
  return true;
}

export function sortHalls<T extends SearchableHall>(halls: T[], sort: HallSearch["sort"]): T[] {
  const copy = [...halls];
  if (sort === "price_asc") copy.sort((a, b) => a.basePrice - b.basePrice);
  else if (sort === "price_desc") copy.sort((a, b) => b.basePrice - a.basePrice);
  else if (sort === "capacity") {
    copy.sort((a, b) => relevantCapacity(b, undefined) - relevantCapacity(a, undefined));
  }
  return copy;
}
