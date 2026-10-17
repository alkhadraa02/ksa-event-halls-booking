import { db } from "@/lib/db";
import { json, readJson, vendorFromSession } from "@/lib/api-auth";
import { fieldErrors, packageSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

async function owned(id: string, vendorId: string) {
  const pkg = await db.package.findUnique({ where: { id }, include: { hall: true } });
  return pkg && pkg.hall.vendorId === vendorId ? pkg : null;
}

export async function PUT(request: Request, { params }: Ctx) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!(await owned(id, auth.vendor.id))) return json({ error: "الباقة غير موجودة" }, 404);
  const body = (await readJson(request)) as Record<string, unknown> | undefined;
  if (body && Object.keys(body).length === 1 && typeof body.active === "boolean") {
    await db.package.update({ where: { id }, data: { active: body.active } });
    return json({ ok: true });
  }
  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) return json({ error: "تحقق من البيانات المدخلة", fields: fieldErrors(parsed.error) }, 422);
  await db.package.update({ where: { id }, data: parsed.data });
  return json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!(await owned(id, auth.vendor.id))) return json({ error: "الباقة غير موجودة" }, 404);
  await db.package.delete({ where: { id } });
  return json({ ok: true });
}
