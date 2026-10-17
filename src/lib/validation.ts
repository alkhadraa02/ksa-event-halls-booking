import { z } from "zod";
import { CATEGORY_KEYS, EVENT_TYPE_KEYS, SECTION_KEYS } from "./format";
import { isValidDateKey } from "./dates";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

export const phoneSchema = z
  .string()
  .trim()
  .transform((s) => toLatinDigits(s).replace(/[\s-]/g, ""))
  .refine((s) => /^(?:\+?966|0)?5\d{8}$/.test(s), "رقم الجوال السعودي غير صحيح")
  .transform((s) => "0" + s.replace(/^(?:\+?966|0)/, ""));

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(120, "البريد الإلكتروني طويل")
  .pipe(z.email("البريد الإلكتروني غير صحيح"));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "أدخل كلمة المرور").max(200),
});

export const registerSchema = z.object({
  name: z.string().trim().min(3, "الاسم قصير").max(80),
  email: emailSchema,
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل").max(200),
  phone: phoneSchema,
  businessName: z.string().trim().min(3, "اسم المنشأة قصير").max(100),
  city: z.string().trim().min(2, "اختر المدينة").max(40),
});

export const bookingSchema = z.object({
  hallId: z.string().min(1, "القاعة مطلوبة"),
  date: z.string().refine(isValidDateKey, "التاريخ غير صحيح"),
  eventType: z.enum(EVENT_TYPE_KEYS, "نوع المناسبة غير صحيح"),
  section: z.enum(SECTION_KEYS, "القسم غير صحيح"),
  guests: z.coerce.number("عدد الحضور غير صحيح").int("عدد الحضور غير صحيح").min(10, "الحد الأدنى 10 ضيوف").max(5000),
  customerName: z.string().trim().min(3, "الاسم قصير").max(80),
  customerPhone: phoneSchema,
  customerEmail: z.union([z.literal(""), emailSchema]).default(""),
  notes: z.string().trim().max(500, "الملاحظات طويلة").default(""),
  packageIds: z.array(z.string().min(1)).max(20).default([]),
});

export type BookingInput = z.infer<typeof bookingSchema>;

const int = (label: string, min: number, max: number) =>
  z.coerce.number(`${label} غير صحيح`).int(`${label} غير صحيح`).min(min, `${label} غير صحيح`).max(max, `${label} غير صحيح`);

export const hallSchema = z.object({
  name: z.string().trim().min(3, "اسم القاعة قصير").max(100),
  city: z.string().trim().min(2, "اختر المدينة").max(40),
  district: z.string().trim().max(60).default(""),
  description: z.string().trim().max(2000).default(""),
  section: z.enum(SECTION_KEYS, "القسم غير صحيح"),
  capacityMen: int("سعة الرجال", 0, 5000),
  capacityWomen: int("سعة النساء", 0, 5000),
  basePrice: int("السعر", 500, 1_000_000),
  depositPercent: int("نسبة العربون", 5, 100),
  amenities: z.string().trim().max(500).default(""),
  published: z.boolean().default(false),
});

export const packageSchema = z.object({
  name: z.string().trim().min(2, "اسم الباقة قصير").max(100),
  category: z.enum(CATEGORY_KEYS, "التصنيف غير صحيح"),
  description: z.string().trim().max(500).default(""),
  price: int("السعر", 0, 1_000_000),
});

export const blockSchema = z.object({
  date: z.string().refine(isValidDateKey, "التاريخ غير صحيح"),
  reason: z.string().trim().max(120).default(""),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "بيانات غير صحيحة";
}
