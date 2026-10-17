"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VendorActions({ id, status, name }: { id: string; status: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function set(next: "APPROVED" | "REJECTED") {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/vendors/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("تعذّر تحديث الحالة");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        {status !== "APPROVED" && (
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => set("APPROVED")} aria-label={`اعتماد ${name}`}>
            اعتماد
          </button>
        )}
        {status !== "REJECTED" && (
          <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => set("REJECTED")} aria-label={`${status === "APPROVED" ? "إيقاف" : "رفض"} ${name}`}>
            {status === "APPROVED" ? "إيقاف" : "رفض"}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}
