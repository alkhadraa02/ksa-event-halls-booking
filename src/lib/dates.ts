// Calendar days are handled as plain "YYYY-MM-DD" keys (no time zones in storage).
const TZ = "Asia/Riyadh";

export const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const pad = (n: number) => String(n).padStart(2, "0");

export function todayKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function toKey(year: number, month0: number, day: number): string {
  return `${year}-${pad(month0 + 1)}-${pad(day)}`;
}

export function addDaysKey(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function parseKey(key: string): { year: number; month0: number; day: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month0: m - 1, day: d };
}

export function shiftMonth(ym: { year: number; month0: number }, delta: number) {
  const total = ym.year * 12 + ym.month0 + delta;
  return { year: Math.floor(total / 12), month0: ((total % 12) + 12) % 12 };
}

/** Weeks (Sunday first) of a month; null pads days outside the month. */
export function monthGrid(year: number, month0: number): (string | null)[][] {
  const lead = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toKey(year, month0, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function formatDateAr(key: string): string {
  if (!isValidDateKey(key)) return key;
  const { year, month0, day } = parseKey(key);
  const weekday = WEEKDAYS_AR[new Date(`${key}T00:00:00Z`).getUTCDay()];
  return `${weekday} ${day} ${MONTHS_AR[month0]} ${year}`;
}

export function monthLabel(year: number, month0: number): string {
  return `${MONTHS_AR[month0]} ${year}`;
}
