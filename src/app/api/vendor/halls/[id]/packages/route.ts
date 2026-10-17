import { db } from "@/lib/db";
import { json, ownedHall, readJson, vendorFromSession } from "@/lib/api-auth";
import { fieldErrors, packageSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!(await ownedHall(id, auth.vendor.id))) return json({ error: "القاعة غير موجودة" }, 404);
  const parsed = packageSchema.safeParse(await readJson(request));
  if (!parsed.success) return json({ error: "تحقق من البيانات المدخلة", fields: fieldErrors(parsed.error) }, 422);
  const pkg = await db.package.create({ data: { ...parsed.data, hallId: id } });
  return json({ id: pkg.id }, 201);
}
