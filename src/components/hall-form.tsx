"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, SECTION_LABEL } from "@/lib/format";

type Values = {
  name: string;
  city: string;
  district: string;
  description: string;
  section: string;
  capacityMen: number | string;
  capacityWomen: number | string;
  basePrice: number | string;
  depositPercent: number | string;
  amenities: string;
  published: boolean;
};

const EMPTY: Values = {
  name: "",
  city: "الرياض",
  district: "",
  description: "",
  section: "BOTH",
  capacityMen: 300,
  capacityWomen: 300,
  basePrice: 15000,
  depositPercent: 20,
  amenities: "",
  published: true,
};

export function HallForm({ hallId, initial }: { hallId?: string; initial?: Partial<Values> }) {
  const router = useRouter();
  const [v, setV] = useState<Values>({ ...EMPTY, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((cur) => ({ ...cur, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOk("");
    setFields({});
    try {
      const res = await fetch(hallId ? `/api/vendor/halls/${hallId}` : "/api/vendor/halls", {
        method: hallId ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(v),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "تعذّر الحفظ");
        setFields(json.fields ?? {});
        return;
      }
      if (!hallId) {
        router.push(`/dashboard/halls/${json.id}`);
        router.refresh();
      } else {
        setOk("تم حفظ التعديلات");
        router.refresh();
      }
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setBusy(false);
    }
  }

  const bad = (k: string) => ({ "aria-invalid": fields[k] ? true : undefined, "aria-describedby": fields[k] ? `h-e-${k}` : undefined });
  const err = (k: string) =>
    fields[k] ? (
      <p id={`h-e-${k}`} className="error-text">
        {fields[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <label htmlFor="h-name" className="label">
          اسم القاعة
        </label>
        <input id="h-name" className="field" value={v.name} onChange={(e) => set("name", e.target.value)} {...bad("name")} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="h-city" className="label">
          المدينة
        </label>
        <select id="h-city" className="field" value={v.city} onChange={(e) => set("city", e.target.value)}>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="h-district" className="label">
          الحي
        </label>
        <input id="h-district" className="field" value={v.district} onChange={(e) => set("district", e.target.value)} {...bad("district")} />
        {err("district")}
      </div>
      <div>
        <label htmlFor="h-section" className="label">
          الأقسام
        </label>
        <select id="h-section" className="field" value={v.section} onChange={(e) => set("section", e.target.value)}>
          {Object.entries(SECTION_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="h-price" className="label">
          سعر القاعة (ر.س)
        </label>
        <input id="h-price" type="number" inputMode="numeric" className="field" value={v.basePrice} onChange={(e) => set("basePrice", e.target.value)} {...bad("basePrice")} />
        {err("basePrice")}
      </div>
      {v.section !== "WOMEN" && (
        <div>
          <label htmlFor="h-men" className="label">
            سعة الرجال
          </label>
          <input id="h-men" type="number" inputMode="numeric" className="field" value={v.capacityMen} onChange={(e) => set("capacityMen", e.target.value)} {...bad("capacityMen")} />
          {err("capacityMen")}
        </div>
      )}
      {v.section !== "MEN" && (
        <div>
          <label htmlFor="h-women" className="label">
            سعة النساء
          </label>
          <input id="h-women" type="number" inputMode="numeric" className="field" value={v.capacityWomen} onChange={(e) => set("capacityWomen", e.target.value)} {...bad("capacityWomen")} />
          {err("capacityWomen")}
        </div>
      )}
      <div>
        <label htmlFor="h-deposit" className="label">
          نسبة العربون ٪
        </label>
        <input id="h-deposit" type="number" inputMode="numeric" className="field" value={v.depositPercent} onChange={(e) => set("depositPercent", e.target.value)} {...bad("depositPercent")} />
        {err("depositPercent")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="h-amenities" className="label">
          المرافق (افصل بينها بفاصلة)
        </label>
        <input id="h-amenities" className="field" value={v.amenities} onChange={(e) => set("amenities", e.target.value)} placeholder="مواقف سيارات، تكييف مركزي، مسرح" {...bad("amenities")} />
        {err("amenities")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="h-desc" className="label">
          الوصف
        </label>
        <textarea id="h-desc" rows={4} className="field" value={v.description} onChange={(e) => set("description", e.target.value)} {...bad("description")} />
        {err("description")}
      </div>
      <label className="flex items-center gap-3 sm:col-span-2">
        <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={v.published} onChange={(e) => set("published", e.target.checked)} />
        <span>منشورة للعملاء (تظهر فقط بعد اعتماد المنشأة)</span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-bad-soft p-3 text-bad sm:col-span-2">
          {error}
        </p>
      )}
      {ok && (
        <p role="status" className="rounded-xl bg-ok-soft p-3 text-ok sm:col-span-2">
          {ok}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "جارٍ الحفظ…" : hallId ? "حفظ التعديلات" : "إضافة القاعة"}
        </button>
      </div>
    </form>
  );
}
