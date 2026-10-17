import { db } from "@/lib/db";
import { json, ownedHall, readJson, vendorFromSession } from "@/lib/api-auth";
import { blockSchema, fieldErrors } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!(await ownedHall(id, auth.vendor.id))) return json({ error: "القاعة غير موجودة" }, 404);
  const parsed = blockSchema.safeParse(await readJson(request));
  if (!parsed.success) return json({ error: "التاريخ غير صحيح", fields: fieldErrors(parsed.error) }, 422);
  const { date, reason } = parsed.data;
  const taken = await db.booking.findFirst({ where: { hallId: id, date, status: "APPROVED" } });
  if (taken) return json({ error: "يوجد حجز مؤكَّد في هذا التاريخ" }, 409);
  await db.blockedDate.upsert({
    where: { hallId_date: { hallId: id, date } },
    create: { hallId: id, date, reason },
    update: { reason },
  });
  return json({ ok: true }, 201);
}

export async function DELETE(request: Request, { params }: Ctx) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!(await ownedHall(id, auth.vendor.id))) return json({ error: "القاعة غير موجودة" }, 404);
  const parsed = blockSchema.pick({ date: true }).safeParse(await readJson(request));
  if (!parsed.success) return json({ error: "التاريخ غير صحيح" }, 422);
  await db.blockedDate.deleteMany({ where: { hallId: id, date: parsed.data.date } });
  return json({ ok: true });
}
