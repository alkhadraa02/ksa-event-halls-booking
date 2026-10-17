export const CITIES = [
  "الرياض",
  "جدة",
  "الدمام",
  "الخبر",
  "مكة المكرمة",
  "المدينة المنورة",
  "الطائف",
  "أبها",
  "بريدة",
  "تبوك",
];

export const SECTION_KEYS = ["BOTH", "MEN", "WOMEN"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABEL: Record<string, string> = {
  BOTH: "قسم رجال وقسم نساء",
  MEN: "قسم الرجال فقط",
  WOMEN: "قسم النساء فقط",
};

export const SECTION_SHORT: Record<string, string> = {
  BOTH: "رجال ونساء",
  MEN: "رجال",
  WOMEN: "نساء",
};

export const CATEGORY_KEYS = ["CATERING", "DECORATION", "PHOTOGRAPHY", "OTHER"] as const;

export const CATEGORY_LABEL: Record<string, string> = {
  CATERING: "الضيافة والبوفيه",
  DECORATION: "التنسيق والديكور",
  PHOTOGRAPHY: "التصوير",
  OTHER: "خدمات أخرى",
};

export const EVENT_TYPES = [
  { key: "WEDDING", label: "حفل زفاف" },
  { key: "ENGAGEMENT", label: "حفل خطوبة" },
  { key: "GRADUATION", label: "حفل تخرج" },
  { key: "BIRTHDAY", label: "عيد ميلاد" },
  { key: "CORPORATE", label: "فعالية شركات" },
  { key: "OTHER", label: "مناسبة أخرى" },
] as const;

export const EVENT_TYPE_KEYS = EVENT_TYPES.map((e) => e.key) as [string, ...string[]];

export const EVENT_LABEL: Record<string, string> = Object.fromEntries(EVENT_TYPES.map((e) => [e.key, e.label]));

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "مؤكَّد",
  DECLINED: "مرفوض",
};

export const VENDOR_STATUS_LABEL: Record<string, string> = {
  PENDING: "بانتظار الاعتماد",
  APPROVED: "معتمد",
  REJECTED: "مرفوض",
};

export function formatSar(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-US")} ر.س`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function splitAmenities(value: string): string[] {
  return value
    .split(/[،,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
