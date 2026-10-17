import { z } from "zod";
import { json, readJson, vendorFromSession } from "@/lib/api-auth";
import { decideBooking } from "@/lib/booking-service";

const schema = z.object({ decision: z.enum(["APPROVED", "DECLINED"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await vendorFromSession();
  if ("error" in auth) return auth.error;
  if (auth.vendor.status !== "APPROVED") return json({ error: "حساب المنشأة غير معتمد بعد" }, 403);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return json({ error: "قرار غير صحيح" }, 422);
  const { id } = await params;
  const res = await decideBooking(id, auth.vendor.id, parsed.data.decision);
  if (!res.ok) return json({ error: res.error }, res.status);
  return json(res.data);
}
