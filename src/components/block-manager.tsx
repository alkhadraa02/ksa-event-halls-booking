"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "./calendar";
import type { DayMarker, DayState } from "@/lib/booking";
import { formatDateAr } from "@/lib/dates";

export function BlockManager({ hallId, dayMap, today }: { hallId: string; dayMap: Record<string, DayMarker>; today: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const marker = selected ? dayMap[selected] : undefined;
  const isBlocked = marker === "blocked";

  async function act() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setMsg("");
    const res = await fetch(`/api/vendor/halls/${hallId}/blocks`, {
      method: isBlocked ? "DELETE" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: selected, reason }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "تعذّر التنفيذ");
      return;
    }
    setMsg(isBlocked ? "تم فتح التاريخ" : "تم حجب التاريخ");
    setReason("");
    router.refresh();
  }

  const canSelect = (s: DayState) => s === "available" || s === "blocked" || s === "held";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Calendar dayMap={dayMap} today={today} selected={selected} onSelect={setSelected} canSelect={canSelect} />
      <div className="card h-fit p-4">
        <h3 className="font-bold">حجب أو فتح تاريخ</h3>
        <p className="mt-1 text-sm text-muted">اختر يوماً من التقويم لحجبه (صيانة، مناسبة خاصة) أو لإعادة فتحه. الأيام المحجوزة بحجز مؤكَّد لا تُحجب.</p>
        <p className="mt-3 text-sm" aria-live="polite">
          {selected ? `التاريخ المختار: ${formatDateAr(selected)}` : "لم تختر تاريخاً"}
        </p>
        {selected && !isBlocked && (
          <div className="mt-3">
            <label htmlFor="bl-reason" className="label">
              السبب (اختياري)
            </label>
            <input id="bl-reason" className="field" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}
        <button type="button" className="btn btn-primary mt-3" disabled={!selected || busy} onClick={act}>
          {isBlocked ? "فتح التاريخ" : "حجب التاريخ"}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-bad">
            {error}
          </p>
        )}
        {msg && (
          <p role="status" className="mt-2 text-ok">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
