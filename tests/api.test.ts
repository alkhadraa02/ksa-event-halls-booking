import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { POST as createBookingRoute } from "@/app/api/bookings/route";
import { GET as health } from "@/app/api/health/route";
import { decideBooking } from "@/lib/booking-service";
import { addDaysKey, todayKey } from "@/lib/dates";
import { resetRateLimit } from "@/lib/rate-limit";

let hallId = "";
let vendorId = "";
let otherVendorId = "";
let pkgId = "";
const future = addDaysKey(todayKey(), 40);

function post(body: unknown) {
  return createBookingRoute(
    new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const payload = (over: Record<string, unknown> = {}) => ({
  hallId,
  date: future,
  eventType: "WEDDING",
  section: "BOTH",
  guests: 200,
  customerName: "عميل تجريبي",
  customerPhone: "0555550199",
  packageIds: [pkgId],
  ...over,
});

beforeAll(async () => {
  const user = await db.user.create({
    data: { email: "t1@example.test", name: "بائع", passwordHash: "x", role: "VENDOR" },
  });
  const vendor = await db.vendor.create({
    data: { userId: user.id, businessName: "منشأة اختبار", city: "الرياض", phone: "0500000000", status: "APPROVED" },
  });
  vendorId = vendor.id;
  const other = await db.user.create({
    data: { email: "t2@example.test", name: "بائع آخر", passwordHash: "x", role: "VENDOR" },
  });
  otherVendorId = (
    await db.vendor.create({
      data: { userId: other.id, businessName: "منشأة أخرى", city: "جدة", phone: "0500000001", status: "APPROVED" },
    })
  ).id;
  const hall = await db.hall.create({
    data: {
      vendorId,
      name: "قاعة الاختبار",
      slug: "test-hall",
      city: "الرياض",
      section: "BOTH",
      capacityMen: 200,
      capacityWomen: 200,
      basePrice: 20000,
      depositPercent: 20,
    },
  });
  hallId = hall.id;
  pkgId = (await db.package.create({ data: { hallId, name: "تصوير", category: "PHOTOGRAPHY", price: 5000 } })).id;
  await db.blockedDate.create({ data: { hallId, date: addDaysKey(todayKey(), 50), reason: "صيانة" } });
  resetRateLimit();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("POST /api/bookings", () => {
  it("creates a pending booking and returns the deposit", async () => {
    const res = await post(payload());
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.totalAmount).toBe(25000);
    expect(json.depositAmount).toBe(5000);
    expect(json.status).toBe("PENDING");
    expect(json.ref).toMatch(/^EV-/);
  });

  it("rejects invalid input with field errors", async () => {
    const res = await post(payload({ customerPhone: "123", guests: 3 }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.fields.customerPhone).toBeTruthy();
    expect(json.fields.guests).toBeTruthy();
  });

  it("rejects guests above the section capacity", async () => {
    const res = await post(payload({ section: "MEN", guests: 250 }));
    expect(res.status).toBe(422);
  });

  it("rejects past dates and blocked dates", async () => {
    expect((await post(payload({ date: addDaysKey(todayKey(), -2) }))).status).toBe(422);
    expect((await post(payload({ date: addDaysKey(todayKey(), 50) }))).status).toBe(409);
  });

  it("returns 404 for an unknown hall", async () => {
    expect((await post(payload({ hallId: "missing" }))).status).toBe(404);
  });

  it("rejects malformed JSON", async () => {
    const res = await createBookingRoute(
      new Request("http://localhost/api/bookings", { method: "POST", body: "{not json" }),
    );
    expect(res.status).toBe(400);
  });
});

describe("approving bookings", () => {
  it("approves one request, auto-declines others on that date, and blocks new requests", async () => {
    const date = addDaysKey(todayKey(), 60);
    const a = await (await post(payload({ date, customerPhone: "0555550201" }))).json();
    const b = await (await post(payload({ date, customerPhone: "0555550202" }))).json();
    const rowA = await db.booking.findUniqueOrThrow({ where: { ref: a.ref } });
    const rowB = await db.booking.findUniqueOrThrow({ where: { ref: b.ref } });

    const wrongVendor = await decideBooking(rowA.id, otherVendorId, "APPROVED");
    expect(wrongVendor.ok).toBe(false);

    const ok = await decideBooking(rowA.id, vendorId, "APPROVED");
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.data.autoDeclined).toBe(1);
    expect((await db.booking.findUniqueOrThrow({ where: { id: rowB.id } })).status).toBe("DECLINED");

    expect((await post(payload({ date, customerPhone: "0555550203" }))).status).toBe(409);
    expect((await decideBooking(rowA.id, vendorId, "DECLINED")).ok).toBe(false);
  });
});

describe("GET /api/health", () => {
  it("reports ok when the database answers", async () => {
    const res = await health();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
