"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_KEYS, CATEGORY_LABEL, formatSar } from "@/lib/format";

type Pkg = { id: string; name: string; category: string; description: string; price: number; active: boolean };

export function PackageManager({ hallId, packages }: { hallId: string; packages: Pkg[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("CATERING");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function reset() {
    setEditing(null);
    setName("");
    setCategory("CATERING");
    setDescription("");
    setPrice("");
    setError("");
    setFields({});
  }

  function startEdit(p: Pkg) {
    setEditing(p);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setPrice(String(p.price));
    setError("");
    setFields({});
  }

  async function call(url: string, method: string, body?: unknown) {
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    const payload = { name, category, description, price };
    const r = editing ? await call(`/api/vendor/packages/${editing.id}`, "PUT", payload) : await call(`/api/vendor/halls/${hallId}/packages`, "POST", payload);
    setBusy(false);
    if (!r.ok) {
      setError(r.json.error ?? "تعذّر الحفظ");
      setFields(r.json.fields ?? {});
      return;
    }
    reset();
    router.refresh();
  }

  async function toggle(p: Pkg) {
    await call(`/api/vendor/packages/${p.id}`, "PUT", { active: !p.active });
    router.refresh();
  }

  async function remove(p: Pkg) {
    if (!window.confirm(`حذف الباقة «${p.name}»؟`)) return;
    await call(`/api/vendor/packages/${p.id}`, "DELETE");
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      {packages.length === 0 ? (
        <p className="text-muted">لم تضف باقات بعد. أضف ضيافة أو تنسيقاً أو تصويراً ليختارها العملاء.</p>
      ) : (
        <ul className="grid gap-2">
          {packages.map((p) => (
            <li key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {p.name} {!p.active && <span className="badge badge-muted">موقوفة</span>}
                </p>
                <p className="text-sm text-muted">
                  {CATEGORY_LABEL[p.category]} · {formatSar(p.price)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>
                  تعديل
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => toggle(p)}>
                  {p.active ? "إيقاف" : "تفعيل"}
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(p)}>
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={save} className="card grid gap-3 bg-surface-2 p-4 sm:grid-cols-2" noValidate aria-label={editing ? "تعديل باقة" : "إضافة باقة"}>
        <h3 className="font-bold sm:col-span-2">{editing ? `تعديل: ${editing.name}` : "إضافة باقة"}</h3>
        <div>
          <label htmlFor="p-name" className="label">
            اسم الباقة
          </label>
          <input id="p-name" className="field" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={fields.name ? true : undefined} />
          {fields.name && <p className="error-text">{fields.name}</p>}
        </div>
        <div>
          <label htmlFor="p-cat" className="label">
            التصنيف
          </label>
          <select id="p-cat" className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={k}>
                {CATEGORY_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-price" className="label">
            السعر (ر.س)
          </label>
          <input id="p-price" type="number" inputMode="numeric" className="field" value={price} onChange={(e) => setPrice(e.target.value)} aria-invalid={fields.price ? true : undefined} />
          {fields.price && <p className="error-text">{fields.price}</p>}
        </div>
        <div>
          <label htmlFor="p-desc" className="label">
            الوصف
          </label>
          <input id="p-desc" className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="text-bad sm:col-span-2">
            {error}
          </p>
        )}
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {editing ? "حفظ الباقة" : "إضافة الباقة"}
          </button>
          {editing && (
            <button type="button" className="btn btn-outline" onClick={reset}>
              إلغاء
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
