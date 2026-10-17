import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { db } from "./db";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

export async function vendorFromSession() {
  const user = await getCurrentUser();
  if (!user) return { error: json({ error: "يجب تسجيل الدخول" }, 401) } as const;
  if (user.role !== "VENDOR" || !user.vendor) return { error: json({ error: "غير مصرّح" }, 403) } as const;
  return { vendor: user.vendor } as const;
}

export async function adminFromSession() {
  const user = await getCurrentUser();
  if (!user) return { error: json({ error: "يجب تسجيل الدخول" }, 401) } as const;
  if (user.role !== "ADMIN") return { error: json({ error: "غير مصرّح" }, 403) } as const;
  return { user } as const;
}

export async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/** Hall owned by vendor, or null. */
export async function ownedHall(hallId: string, vendorId: string) {
  const hall = await db.hall.findUnique({ where: { id: hallId } });
  return hall && hall.vendorId === vendorId ? hall : null;
}

export function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "hall";
}

export async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name).slice(0, 60);
  let slug = base;
  for (let i = 2; await db.hall.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
  return slug;
}
