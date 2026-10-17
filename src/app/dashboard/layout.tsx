import type { Metadata } from "next";
import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { VENDOR_STATUS_LABEL } from "@/lib/format";

export const metadata: Metadata = { title: "لوحة المنشأة", robots: { index: false, follow: false } };

const nav = [
  { href: "/dashboard", label: "نظرة عامة" },
  { href: "/dashboard/halls", label: "القاعات" },
  { href: "/dashboard/bookings", label: "طلبات الحجز" },
  { href: "/dashboard/customers", label: "العملاء" },
  { href: "/dashboard/revenue", label: "الإيرادات" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { vendor } = await requireVendor();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 truncate font-bold">{vendor.businessName}</p>
        <span className={`badge ${vendor.status === "APPROVED" ? "badge-ok" : vendor.status === "PENDING" ? "badge-warn" : "badge-bad"}`}>
          {VENDOR_STATUS_LABEL[vendor.status]}
        </span>
      </div>
      {vendor.status !== "APPROVED" && (
        <p role="status" className="mt-3 rounded-xl bg-warn-soft p-3 text-warn">
          {vendor.status === "PENDING"
            ? "حسابك قيد المراجعة. يمكنك تجهيز قاعاتك وباقاتك الآن، وستظهر للعملاء بعد اعتماد الإدارة."
            : "تم رفض اعتماد منشأتك. تواصل مع إدارة المنصة."}
        </p>
      )}
      <nav aria-label="أقسام اللوحة" className="mt-4 flex gap-1 overflow-x-auto border-b border-line pb-2">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-brand-soft">
            {n.label}
          </Link>
        ))}
      </nav>
      <main className="mt-6">{children}</main>
    </div>
  );
}
