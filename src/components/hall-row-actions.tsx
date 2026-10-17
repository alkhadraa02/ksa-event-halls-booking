"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HallDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  async function remove() {
    if (!window.confirm(`حذف القاعة «${name}» نهائياً مع باقاتها وحجوزاتها؟`)) return;
    const res = await fetch(`/api/vendor/halls/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "تعذّر الحذف");
      return;
    }
    router.refresh();
  }
  return (
    <span className="inline-flex flex-col">
      <button type="button" className="btn btn-danger btn-sm" onClick={remove} aria-label={`حذف ${name}`}>
        حذف
      </button>
      {error && (
        <span role="alert" className="error-text max-w-48">
          {error}
        </span>
      )}
    </span>
  );
}
