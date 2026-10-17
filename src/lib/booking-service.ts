import { db } from "./db";
import { calcQuote, generateRef, guestsWithinCapacity, sectionSupported } from "./booking";
import { todayKey } from "./dates";
import type { BookingInput } from "./validation";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; field?: string };

const fail = (status: number, error: string, field?: string) => ({ ok: false as const, status, error, field });

export async function createBooking(
  input: BookingInput,
  now: Date = new Date(),
): Promise<
  ServiceResult<{ ref: string; totalAmount: number; depositAmount: number; status: string }>
> {
  const hall = await db.hall.findUnique({
    where: { id: input.hallId },
    include: { vendor: true, packages: { where: { active: true } } },
  });
  if (!hall || !hall.published || hall.vendor.status !== "APPROVED") {
    return fail(404, "القاعة غير متاحة للحجز", "hallId");
  }
  if (input.date < todayKey(now)) return fail(422, "لا يمكن الحجز في تاريخ سابق", "date");
  if (!sectionSupported(hall.section, input.section)) {
    return fail(422, "القسم المطلوب غير متوفر في هذه القاعة", "section");
  }
  if (!guestsWithinCapacity(hall, input.section, input.guests)) {
    return fail(422, "عدد الحضور يتجاوز سعة القاعة للقسم المختار", "guests");
  }

  const ids = [...new Set(input.packageIds)];
  const addons = hall.packages.filter((p) => ids.includes(p.id));
  if (addons.length !== ids.length) return fail(422, "إحدى الباقات المختارة غير متاحة", "packageIds");

  const quote = calcQuote({ basePrice: hall.basePrice, depositPercent: hall.depositPercent, addons });

  return db.$transaction(async (tx) => {
    const blocked = await tx.blockedDate.findUnique({ where: { hallId_date: { hallId: hall.id, date: input.date } } });
    if (blocked) return fail(409, "هذا التاريخ غير متاح", "date");
    const taken = await tx.booking.findFirst({ where: { hallId: hall.id, date: input.date, status: "APPROVED" } });
    if (taken) return fail(409, "هذا التاريخ محجوز مسبقاً", "date");

    const booking = await tx.booking.create({
      data: {
        ref: generateRef(),
        hallId: hall.id,
        date: input.date,
        eventType: input.eventType,
        section: input.section,
        guests: input.guests,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        notes: input.notes,
        status: "PENDING",
        ...quote,
        packages: { create: addons.map((a) => ({ packageId: a.id, name: a.name, price: a.price })) },
      },
    });
    return {
      ok: true as const,
      data: {
        ref: booking.ref,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
        status: booking.status,
      },
    };
  });
}

export async function decideBooking(
  bookingId: string,
  vendorId: string,
  decision: "APPROVED" | "DECLINED",
): Promise<ServiceResult<{ status: string; autoDeclined: number }>> {
  const booking = await db.booking.findUnique({ where: { id: bookingId }, include: { hall: true } });
  if (!booking || booking.hall.vendorId !== vendorId) return fail(404, "الطلب غير موجود");
  if (booking.status !== "PENDING") return fail(409, "تم البتّ في هذا الطلب مسبقاً");

  return db.$transaction(async (tx) => {
    let autoDeclined = 0;
    if (decision === "APPROVED") {
      const blocked = await tx.blockedDate.findUnique({
        where: { hallId_date: { hallId: booking.hallId, date: booking.date } },
      });
      if (blocked) return fail(409, "التاريخ محجوب في تقويم القاعة");
      const taken = await tx.booking.findFirst({
        where: { hallId: booking.hallId, date: booking.date, status: "APPROVED", NOT: { id: booking.id } },
      });
      if (taken) return fail(409, "التاريخ مؤكَّد مسبقاً لطلب آخر");
      const res = await tx.booking.updateMany({
        where: { hallId: booking.hallId, date: booking.date, status: "PENDING", NOT: { id: booking.id } },
        data: { status: "DECLINED", decidedAt: new Date() },
      });
      autoDeclined = res.count;
    }
    await tx.booking.update({ where: { id: booking.id }, data: { status: decision, decidedAt: new Date() } });
    return { ok: true as const, data: { status: decision, autoDeclined } };
  });
}
