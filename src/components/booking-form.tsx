"use client";

import { useMemo, useState } from "react";
import { Calendar } from "./calendar";
import { calcQuote, type DayMarker } from "@/lib/booking";
import { CATEGORY_LABEL, EVENT_TYPES, formatNumber, formatSar, SECTION_LABEL } from "@/lib/format";
import { formatDateAr } from "@/lib/dates";

type Pkg = { id: string; name: string; category: string; price: number; description: string };

type Props = {
  hall: {
    id: string;
    name: string;
    section: string;
    capacityMen: number;
    capacityWomen: number;
    basePrice: number;
    depositPercent: number;
  };
  packages: Pkg[];
  dayMap: Record<string, DayMarker>;
  today: string;
};

type Done = { ref: string; totalAmount: number; depositAmount: number };

export function BookingForm({ hall, packages, dayMap, today }: Props) {
  const sections = hall.section === "BOTH" ? ["BOTH", "MEN", "WOMEN"] : [hall.section];
  const [date, setDate] = useState("");
  const [section, setSection] = useState(sections[0]);
  const [eventType, setEventType] = useState("WEDDING");
  const [guests, setGuests] = useState("150");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Done | null>(null);

  const quote = useMemo(
    () =>
      calcQuote({
        basePrice: hall.basePrice,
        depositPercent: hall.depositPercent,
        addons: packages.filter((p) => picked.includes(p.id)),
      }),
    [hall.basePrice, hall.depositPercent, packages, picked],
  );

  const toggle = (id: string) => setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFields({});
    if (!date) {
      setFields({ date: "اختر تاريخ المناسبة من التقويم" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hallId: hall.id,
          date,
          eventType,
          section,
          guests,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          notes,
          packageIds: picked,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setDone(json);
        return;
      }
      setError(json.error ?? "تعذّر إرسال الطلب");
      setFields(json.fields ?? {});
    } catch {
      setError("تعذّر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card border-ok p-6" role="status">
        <h3 className="text-xl font-bold text-ok">تم استلام طلب الحجز</h3>
        <p className="mt-2">
          رقم الطلب: <strong dir="ltr">{done.ref}</strong>
        </p>
        <dl className="mt-3 grid gap-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt>التاريخ</dt>
            <dd>{formatDateAr(date)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>الإجمالي</dt>
            <dd>{formatSar(done.totalAmount)}</dd>
          </div>
          <div className="flex justify-between gap-2 font-bold text-brand">
            <dt>العربون المطلوب</dt>
            <dd>{formatSar(done.depositAmount)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-muted">سيراجع صاحب القاعة طلبك ويتواصل معك على رقم الجوال. لا يتم أي دفع إلكتروني من خلال المنصة.</p>
      </div>
    );
  }

  const err = (k: string) =>
    fields[k] ? (
      <p id={`e-${k}`} className="error-text">
        {fields[k]}
      </p>
    ) : null;
  const inv = (k: string) => ({ "aria-invalid": fields[k] ? true : undefined, "aria-describedby": fields[k] ? `e-${k}` : undefined });

  return (
    <form onSubmit={submit} className="grid gap-6" noValidate aria-label="طلب حجز">
      <div>
        <p className="label">١. اختر التاريخ</p>
        <Calendar dayMap={dayMap} today={today} selected={date} onSelect={setDate} />
        <p className="mt-2 text-sm" aria-live="polite">
          {date ? `التاريخ المختار: ${formatDateAr(date)}` : "لم تختر تاريخاً بعد"}
        </p>
        {err("date")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="b-event" className="label">
            نوع المناسبة
          </label>
          <select id="b-event" className="field" value={eventType} onChange={(e) => setEventType(e.target.value)}>
            {EVENT_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="b-section" className="label">
            القسم
          </label>
          <select id="b-section" className="field" value={section} onChange={(e) => setSection(e.target.value)} {...inv("section")}>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s === "MEN"
                  ? `قسم الرجال (حتى ${formatNumber(hall.capacityMen)})`
                  : s === "WOMEN"
                    ? `قسم النساء (حتى ${formatNumber(hall.capacityWomen)})`
                    : hall.section === "BOTH"
                      ? `${SECTION_LABEL.BOTH} (حتى ${formatNumber(hall.capacityMen + hall.capacityWomen)})`
                      : SECTION_LABEL[s]}
              </option>
            ))}
          </select>
          {err("section")}
        </div>
        <div>
          <label htmlFor="b-guests" className="label">
            عدد الحضور
          </label>
          <input id="b-guests" type="number" inputMode="numeric" min={10} className="field" value={guests} onChange={(e) => setGuests(e.target.value)} {...inv("guests")} />
          {err("guests")}
        </div>
      </div>

      {packages.length > 0 && (
        <fieldset>
          <legend className="label">٢. أضف باقات (اختياري)</legend>
          <div className="grid gap-2">
            {packages.map((p) => (
              <label key={p.id} className="card flex cursor-pointer items-start gap-3 p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="checkbox" className="mt-1.5 size-5 accent-[var(--brand)]" checked={picked.includes(p.id)} onChange={() => toggle(p.id)} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block text-xs text-muted">{CATEGORY_LABEL[p.category]}</span>
                </span>
                <span className="shrink-0 font-semibold">{formatSar(p.price)}</span>
              </label>
            ))}
          </div>
          {err("packageIds")}
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="b-name" className="label">
            الاسم الكامل
          </label>
          <input id="b-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...inv("customerName")} />
          {err("customerName")}
        </div>
        <div>
          <label htmlFor="b-phone" className="label">
            رقم الجوال
          </label>
          <input id="b-phone" className="field" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} {...inv("customerPhone")} />
          {err("customerPhone")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="b-email" className="label">
            البريد الإلكتروني (اختياري)
          </label>
          <input id="b-email" type="email" dir="ltr" className="field" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...inv("customerEmail")} />
          {err("customerEmail")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="b-notes" className="label">
            ملاحظات (اختياري)
          </label>
          <textarea id="b-notes" rows={3} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} {...inv("notes")} />
          {err("notes")}
        </div>
      </div>

      <div className="card bg-surface-2 p-4" aria-live="polite">
        <h3 className="font-bold">ملخص التكلفة</h3>
        <dl className="mt-2 grid gap-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt>سعر القاعة</dt>
            <dd>{formatSar(quote.hallPrice)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>الباقات المضافة</dt>
            <dd>{formatSar(quote.addonsTotal)}</dd>
          </div>
          <div className="flex justify-between gap-2 border-t border-line pt-1 font-bold">
            <dt>الإجمالي</dt>
            <dd>{formatSar(quote.totalAmount)}</dd>
          </div>
          <div className="flex justify-between gap-2 font-bold text-brand">
            <dt>العربون ({hall.depositPercent}٪)</dt>
            <dd>{formatSar(quote.depositAmount)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted">لا يتم دفع أي مبلغ الآن. العربون يُسدَّد مباشرة لصاحب القاعة بعد الموافقة على طلبك.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-bad-soft p-3 text-bad">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "جارٍ الإرسال…" : "إرسال طلب الحجز"}
      </button>
    </form>
  );
}
