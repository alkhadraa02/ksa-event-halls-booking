import { db } from "@/lib/db";
import { json, ownedHall, readJson, vendorFromSession } from "@/lib/api-auth";
import { fieldErrors, hallSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!(await ownedHall(id, auth.vendor.id))) return json({ error: "القاعة غير موجودة" }, 404);
  const parsed = hallSchema.safeParse(await readJson(request));
  if (!parsed.success) return json({ error: "تحقق من البيانات المدخلة", fields: fieldErrors(parsed.error) }, 422);
  const d = parsed.data;
  await db.hall.update({
    where: { id },
    data: {
      ...d,
      capacityMen: d.section === "WOMEN" ? 0 : d.capacityMen,
      capacityWomen: d.section === "MEN" ? 0 : d.capacityWomen,
    },
  });
  return json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!(await ownedHall(id, auth.vendor.id))) return json({ error: "القاعة غير موجودة" }, 404);
  const pending = await db.booking.count({ where: { hallId: id, status: { in: ["PENDING", "APPROVED"] }, date: { gte: new Date().toISOString().slice(0, 10) } } });
  if (pending > 0) return json({ error: "لا يمكن حذف قاعة لديها حجوزات قادمة. أخفِها من النشر بدلاً من ذلك." }, 409);
  await db.hall.delete({ where: { id } });
  return json({ ok: true });
}
