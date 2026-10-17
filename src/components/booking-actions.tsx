"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookingActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision: "APPROVED" | "DECLINED") {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/vendor/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "تعذّر تنفيذ القرار");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => decide("APPROVED")} aria-label={`قبول طلب ${name}`}>
          قبول
        </button>
        <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => decide("DECLINED")} aria-label={`رفض طلب ${name}`}>
          رفض
        </button>
      </div>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}
