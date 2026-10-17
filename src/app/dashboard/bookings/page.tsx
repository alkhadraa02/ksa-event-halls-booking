import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { db } from "@/lib/db";
import { BOOKING_STATUS_LABEL, EVENT_LABEL, formatSar } from "@/lib/format";
import { formatDateAr } from "@/lib/dates";
import { BookingActions } from "@/components/booking-actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "", label: "الكل" },
  { key: "PENDING", label: "قيد المراجعة" },
  { key: "APPROVED", label: "مؤكَّدة" },
  { key: "DECLINED", label: "مرفوضة" },
];

export default async function VendorBookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { vendor } = await requireVendor();
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status && f.key) ? status : "";
  const bookings = await db.booking.findMany({
    where: { hall: { vendorId: vendor.id }, ...(active ? { status: active } : {}) },
    include: { hall: { select: { name: true } }, packages: true },
    orderBy: [{ date: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">طلبات الحجز</h1>
      <nav aria-label="تصفية الطلبات" className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/dashboard/bookings?status=${f.key}` : "/dashboard/bookings"}
            aria-current={(active ?? "") === f.key ? "page" : undefined}
            className={`btn btn-sm ${(active ?? "") === f.key ? "btn-primary" : "btn-outline"}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {bookings.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-muted">لا توجد طلبات في هذا العرض.</p>
      ) : (
        <div className="card table-wrap mt-4">
          <table className="data-table">
            <caption className="sr-only">طلبات الحجز</caption>
            <thead>
              <tr>
                <th scope="col">الطلب</th>
                <th scope="col">العميل</th>
                <th scope="col">القاعة والتاريخ</th>
                <th scope="col">المبلغ</th>
                <th scope="col">الحالة</th>
                <th scope="col">القرار</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td dir="ltr" className="text-sm">
                    {b.ref}
                  </td>
                  <td>
                    <p className="font-semibold">{b.customerName}</p>
                    <p dir="ltr" className="text-start text-sm text-muted">
                      {b.customerPhone}
                    </p>
                  </td>
                  <td>
                    <p>{b.hall.name}</p>
                    <p className="text-sm text-muted">
                      {formatDateAr(b.date)} · {EVENT_LABEL[b.eventType]} · {b.guests} ضيف
                    </p>
                    {b.packages.length > 0 && <p className="text-xs text-muted">+ {b.packages.map((p) => p.name).join("، ")}</p>}
                  </td>
                  <td>
                    <p>{formatSar(b.totalAmount)}</p>
                    <p className="text-sm text-muted">عربون {formatSar(b.depositAmount)}</p>
                  </td>
                  <td>
                    <span className={`badge ${b.status === "APPROVED" ? "badge-ok" : b.status === "PENDING" ? "badge-warn" : "badge-bad"}`}>
                      {BOOKING_STATUS_LABEL[b.status]}
                    </span>
                  </td>
                  <td>{b.status === "PENDING" && vendor.status === "APPROVED" ? <BookingActions id={b.id} name={b.customerName} /> : <span className="text-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
