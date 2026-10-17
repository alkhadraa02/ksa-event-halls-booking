import { describe, expect, it } from "vitest";
import {
  buildDayMap,
  calcDeposit,
  calcQuote,
  dayState,
  generateRef,
  guestsWithinCapacity,
  isRequestable,
  sectionSupported,
} from "@/lib/booking";
import { addDaysKey, isValidDateKey, monthGrid, shiftMonth, todayKey } from "@/lib/dates";
import { matchesHall, parseHallSearch, sortHalls } from "@/lib/search";
import { bookingSchema, phoneSchema } from "@/lib/validation";

describe("pricing", () => {
  it("rounds the deposit up to a whole riyal", () => {
    expect(calcDeposit(10001, 20)).toBe(2001);
    expect(calcDeposit(38000, 20)).toBe(7600);
  });

  it("adds add-ons to the total and computes the deposit on the total", () => {
    const q = calcQuote({ basePrice: 20000, depositPercent: 25, addons: [{ price: 4000 }, { price: 1000 }] });
    expect(q).toEqual({ hallPrice: 20000, addonsTotal: 5000, totalAmount: 25000, depositAmount: 6250 });
  });
});

describe("capacity and sections", () => {
  const hall = { capacityMen: 300, capacityWomen: 200 };
  it("checks capacity per section", () => {
    expect(guestsWithinCapacity(hall, "MEN", 300)).toBe(true);
    expect(guestsWithinCapacity(hall, "MEN", 301)).toBe(false);
    expect(guestsWithinCapacity(hall, "BOTH", 500)).toBe(true);
    expect(guestsWithinCapacity({ capacityMen: 0, capacityWomen: 100 }, "MEN", 10)).toBe(false);
  });
  it("only allows requested sections the hall offers", () => {
    expect(sectionSupported("BOTH", "WOMEN")).toBe(true);
    expect(sectionSupported("MEN", "WOMEN")).toBe(false);
    expect(sectionSupported("WOMEN", "WOMEN")).toBe(true);
  });
});

describe("availability calendar", () => {
  it("lets booked win over held and blocked", () => {
    const map = buildDayMap(
      [
        { date: "2030-01-01", status: "PENDING" },
        { date: "2030-01-01", status: "APPROVED" },
        { date: "2030-01-02", status: "PENDING" },
      ],
      [{ date: "2030-01-01" }, { date: "2030-01-03" }],
    );
    expect(map["2030-01-01"]).toBe("booked");
    expect(map["2030-01-02"]).toBe("held");
    expect(map["2030-01-03"]).toBe("blocked");
  });

  it("derives day state and requestability", () => {
    const map = { "2030-01-02": "held" as const, "2030-01-03": "booked" as const };
    expect(dayState("2029-12-31", "2030-01-01", map)).toBe("past");
    expect(isRequestable(dayState("2030-01-02", "2030-01-01", map))).toBe(true);
    expect(isRequestable(dayState("2030-01-03", "2030-01-01", map))).toBe(false);
    expect(isRequestable(dayState("2030-01-05", "2030-01-01", map))).toBe(true);
  });

  it("builds month grids and validates keys", () => {
    const weeks = monthGrid(2030, 0);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
    expect(isValidDateKey("2030-02-30")).toBe(false);
    expect(isValidDateKey("2030-02-28")).toBe(true);
    expect(addDaysKey("2030-12-31", 1)).toBe("2031-01-01");
    expect(shiftMonth({ year: 2030, month0: 0 }, -1)).toEqual({ year: 2029, month0: 11 });
    expect(todayKey(new Date("2030-06-15T10:00:00Z"))).toBe("2030-06-15");
  });
});

describe("hall search", () => {
  const halls = [
    { city: "الرياض", section: "BOTH", capacityMen: 400, capacityWomen: 300, basePrice: 38000 },
    { city: "الرياض", section: "WOMEN", capacityMen: 0, capacityWomen: 250, basePrice: 14000 },
    { city: "جدة", section: "MEN", capacityMen: 350, capacityWomen: 0, basePrice: 12000 },
  ];

  it("parses query strings safely", () => {
    expect(parseHallSearch({ city: "جدة", capacity: "abc", section: "NOPE", sort: "price_asc" })).toEqual({
      city: "جدة",
      section: undefined,
      capacity: undefined,
      maxPrice: undefined,
      sort: "price_asc",
    });
  });

  it("filters by city, section, capacity and price", () => {
    const f = (q: Record<string, string>) => halls.filter((h) => matchesHall(h, parseHallSearch(q))).length;
    expect(f({ city: "الرياض" })).toBe(2);
    expect(f({ section: "WOMEN" })).toBe(2);
    expect(f({ section: "MEN", capacity: "300" })).toBe(2);
    expect(f({ section: "WOMEN", capacity: "300" })).toBe(1 - 1 + 1);
    expect(f({ maxPrice: "15000" })).toBe(2);
    expect(f({ section: "BOTH" })).toBe(1);
  });

  it("sorts by price", () => {
    expect(sortHalls(halls, "price_asc")[0].basePrice).toBe(12000);
    expect(sortHalls(halls, "price_desc")[0].basePrice).toBe(38000);
  });
});

describe("validation", () => {
  it("normalises Saudi mobile numbers", () => {
    expect(phoneSchema.parse("+966 55 555 0101")).toBe("0555550101");
    expect(phoneSchema.parse("٠٥٥٥٥٥٠١٠١")).toBe("0555550101");
    expect(phoneSchema.safeParse("123").success).toBe(false);
  });

  it("rejects an invalid booking payload", () => {
    const r = bookingSchema.safeParse({ hallId: "x", date: "nope", eventType: "WEDDING", section: "BOTH", guests: 5 });
    expect(r.success).toBe(false);
  });

  it("generates distinct readable references", () => {
    const a = generateRef();
    expect(a).toMatch(/^EV-[A-Z2-9]{8}$/);
    expect(generateRef()).not.toBe(a);
  });
});
