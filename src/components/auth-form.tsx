"use client";

import { useState } from "react";
import { CITIES } from "@/lib/format";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const register = mode === "register";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFields({});
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        window.location.href = json.redirect ?? "/";
        return;
      }
      setError(json.error ?? "حدث خطأ غير متوقع");
      setFields(json.fields ?? {});
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setBusy(false);
    }
  }

  const f = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`a-${k}`} className="label">
        {label}
      </label>
      <input
        id={`a-${k}`}
        name={k}
        className="field"
        required
        aria-invalid={fields[k] ? true : undefined}
        aria-describedby={fields[k] ? `ae-${k}` : undefined}
        {...props}
      />
      {fields[k] && (
        <p id={`ae-${k}`} className="error-text">
          {fields[k]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      {register && f("name", "اسم المسؤول", { autoComplete: "name" })}
      {register && f("businessName", "اسم المنشأة / القاعة")}
      {f("email", "البريد الإلكتروني", { type: "email", dir: "ltr", autoComplete: "email" })}
      {register && f("phone", "رقم الجوال", { dir: "ltr", inputMode: "tel", placeholder: "05xxxxxxxx", autoComplete: "tel" })}
      {register && (
        <div>
          <label htmlFor="a-city" className="label">
            المدينة
          </label>
          <select id="a-city" name="city" className="field" defaultValue="الرياض">
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {fields.city && <p className="error-text">{fields.city}</p>}
        </div>
      )}
      {f("password", "كلمة المرور", { type: "password", dir: "ltr", autoComplete: register ? "new-password" : "current-password", minLength: register ? 8 : undefined })}
      {error && (
        <p role="alert" className="rounded-xl bg-bad-soft p-3 text-bad">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "لحظة…" : register ? "إنشاء الحساب" : "تسجيل الدخول"}
      </button>
    </form>
  );
}
