import { db } from "@/lib/db";
import { json, readJson, uniqueSlug, vendorFromSession } from "@/lib/api-auth";
import { fieldErrors, hallSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  const body = await readJson(request);
  const parsed = hallSchema.safeParse(body);
  if (!parsed.success) return json({ error: "تحقق من البيانات المدخلة", fields: fieldErrors(parsed.error) }, 422);
  const d = parsed.data;
  if (d.section === "MEN" && d.capacityMen < 1) return json({ error: "حدد سعة الرجال", fields: { capacityMen: "حدد السعة" } }, 422);
  if (d.section === "WOMEN" && d.capacityWomen < 1) return json({ error: "حدد سعة النساء", fields: { capacityWomen: "حدد السعة" } }, 422);
  if (d.section === "BOTH" && d.capacityMen + d.capacityWomen < 1) return json({ error: "حدد السعة", fields: { capacityMen: "حدد السعة" } }, 422);
  const hall = await db.hall.create({
    data: {
      ...d,
      capacityMen: d.section === "WOMEN" ? 0 : d.capacityMen,
      capacityWomen: d.section === "MEN" ? 0 : d.capacityWomen,
      vendorId: auth.vendor.id,
      slug: await uniqueSlug(d.name),
    },
  });
  return json({ id: hall.id }, 201);
}
