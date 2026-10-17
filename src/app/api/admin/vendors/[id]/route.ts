import { z } from "zod";
import { db } from "@/lib/db";
import { adminFromSession, json, readJson } from "@/lib/api-auth";

const schema = z.object({ status: z.enum(["APPROVED", "REJECTED", "PENDING"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await adminFromSession();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return json({ error: "حالة غير صحيحة" }, 422);
  const { id } = await params;
  const vendor = await db.vendor.findUnique({ where: { id } });
  if (!vendor) return json({ error: "المنشأة غير موجودة" }, 404);
  await db.vendor.update({ where: { id }, data: { status: parsed.data.status } });
  return json({ ok: true, status: parsed.data.status });
}
