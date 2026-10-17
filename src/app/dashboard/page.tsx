import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { db } from "@/lib/db";
import { summarize } from "@/lib/stats";
import { todayKey, formatDateAr } from "@/lib/dates";
import { EVENT_LABEL, formatSar } from "@/lib/format";
import { BookingActions } from "@/components/booking-actions";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const { vendor } = await requireVendor();
  const bookings = await db.booking.findMany({
    where: { hall: { vendorId: vendor.id } },
    include: { hall: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const hallCount = await db.hall.count({ where: { vendorId: vendor.id } });
  const s = summarize(bookings, todayKey());
  const pending = bookings.filter((b) => b.status === "PENDING").slice(0, 5);

  const cards = [
    { label: "طلبات بانتظار القرار", value: String(s.pending) },
    { label: "حجوزات قادمة مؤكَّدة", value: String(s.upcoming) },
    { label: "إجمالي الإيرادات المؤكَّدة", value: formatSar(s.revenue) },
    { label: "عدد القاعات", value: String(hallCount) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">نظرة عامة</h1>
      <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <dt className="text-sm text-muted">{c.label}</dt>
            <dd className="mt-1 text-xl font-bold text-brand">{c.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8" aria-labelledby="pending-title">
        <div className="flex items-center justify-between gap-2">
          <h2 id="pending-title" className="text-xl font-bold">
            أحدث الطلبات بانتظار القرار
          </h2>
          <Link href="/dashboard/bookings" className="text-sm font-semibold text-brand underline">
            كل الطلبات
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="card mt-3 p-6 text-center text-muted">لا توجد طلبات معلّقة.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {pending.map((b) => (
              <li key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {b.customerName} · {b.hall.name}
                  </p>
                  <p className="text-sm text-muted">
                    {formatDateAr(b.date)} · {EVENT_LABEL[b.eventType]} · {formatSar(b.totalAmount)}
                  </p>
                </div>
                {vendor.status === "APPROVED" ? <BookingActions id={b.id} name={b.customerName} /> : <span className="badge badge-warn">بانتظار اعتماد المنشأة</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {hallCount === 0 && (
        <p className="card mt-8 p-6 text-center">
          لم تضف قاعة بعد.{" "}
          <Link href="/dashboard/halls/new" className="font-semibold text-brand underline">
            أضف قاعتك الأولى
          </Link>
        </p>
      )}
    </div>
  );
}
