import { randomBytes } from "node:crypto";

export type DayState = "available" | "held" | "booked" | "blocked" | "past";
export type DayMarker = "booked" | "held" | "blocked";

export function calcDeposit(total: number, percent: number): number {
  return Math.ceil((total * percent) / 100);
}

export type Quote = {
  hallPrice: number;
  addonsTotal: number;
  totalAmount: number;
  depositAmount: number;
};

export function calcQuote(input: {
  basePrice: number;
  depositPercent: number;
  addons: { price: number }[];
}): Quote {
  const addonsTotal = input.addons.reduce((sum, a) => sum + a.price, 0);
  const totalAmount = input.basePrice + addonsTotal;
  return {
    hallPrice: input.basePrice,
    addonsTotal,
    totalAmount,
    depositAmount: calcDeposit(totalAmount, input.depositPercent),
  };
}

/** Which sections a hall offers vs. which a customer asks for. */
export function sectionSupported(hallSection: string, requested: string): boolean {
  if (hallSection === "BOTH") return true;
  return hallSection === requested;
}

export function capacityFor(hall: { capacityMen: number; capacityWomen: number }, section: string): number {
  if (section === "MEN") return hall.capacityMen;
  if (section === "WOMEN") return hall.capacityWomen;
  return hall.capacityMen + hall.capacityWomen;
}

export function guestsWithinCapacity(
  hall: { capacityMen: number; capacityWomen: number },
  section: string,
  guests: number,
): boolean {
  const cap = capacityFor(hall, section);
  return cap > 0 && guests <= cap;
}

/** Marker per date. Booked beats blocked beats held. */
export function buildDayMap(
  bookings: { date: string; status: string }[],
  blocked: { date: string }[],
): Record<string, DayMarker> {
  const map: Record<string, DayMarker> = {};
  for (const b of bookings) {
    if (b.status === "PENDING" && !map[b.date]) map[b.date] = "held";
  }
  for (const b of blocked) {
    if (map[b.date] !== "booked") map[b.date] = "blocked";
  }
  for (const b of bookings) {
    if (b.status === "APPROVED") map[b.date] = "booked";
  }
  return map;
}

export function dayState(key: string, today: string, map: Record<string, DayMarker>): DayState {
  if (key < today) return "past";
  return map[key] ?? "available";
}

/** A date can receive a new request unless it is past, booked or blocked. Held dates stay requestable. */
export function isRequestable(state: DayState): boolean {
  return state === "available" || state === "held";
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRef(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `EV-${out}`;
}
