import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { fieldErrors, registerSchema } from "@/lib/validation";
import { rateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`register:${ip}`, 8, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "محاولات كثيرة، حاول لاحقاً" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "تحقق من البيانات المدخلة", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;

  const exists = await db.user.findUnique({ where: { email: d.email } });
  if (exists) {
    return NextResponse.json(
      { error: "هذا البريد مسجّل مسبقاً", fields: { email: "هذا البريد مسجّل مسبقاً" } },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      email: d.email,
      name: d.name,
      phone: d.phone,
      passwordHash: await hashPassword(d.password),
      role: "VENDOR",
      vendor: { create: { businessName: d.businessName, city: d.city, phone: d.phone, status: "PENDING" } },
    },
  });
  await createSession(user.id);
  return NextResponse.json({ redirect: "/dashboard" }, { status: 201 });
}
