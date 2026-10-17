import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DUMMY_HASH, createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`login:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "محاولات كثيرة، حاول بعد قليل" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "أدخل البريد الإلكتروني وكلمة المرور" }, { status: 422 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ role: user.role, redirect: user.role === "ADMIN" ? "/admin" : "/dashboard" });
}
