import { NextResponse } from "next/server";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { createBooking } from "@/lib/booking-service";
import { rateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`booking:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "محاولات كثيرة، حاول لاحقاً" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "تحقق من البيانات المدخلة", fields: fieldErrors(parsed.error) }, { status: 422 });
  }

  const result = await createBooking(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, fields: result.field ? { [result.field]: result.error } : undefined },
      { status: result.status },
    );
  }
  return NextResponse.json(result.data, { status: 201 });
}
