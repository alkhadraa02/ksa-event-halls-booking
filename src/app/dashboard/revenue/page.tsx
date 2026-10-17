import { requireVendor } from "@/lib/auth";
import { db } from "@/lib/db";
import { revenueByMonth, summarize } from "@/lib/stats";
import { todayKey } from "@/lib/dates";
import { formatSar } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Revenue() {
  const { vendor } = await requireVendor();
  const bookings = await db.booking.findMany({ where: { hall: { vendorId: vendor.id } } });
  const s = summarize(bookings, todayKey());
  const months = revenueByMonth(bookings);
  const max = Math.max(1, ...months.map((m) => m.total));

  return (
    <div>
      <h1 className="text-2xl font-bold">الإيرادات</h1>
      <p className="mt-1 text-muted">تُحتسب من الحجوزات المؤكَّدة فقط، حسب شهر المناسبة.</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <dt className="text-sm text-muted">إجمالي الإيرادات</dt>
          <dd className="mt-1 text-xl font-bold text-brand">{formatSar(s.revenue)}</dd>
        </div>
        <div className="card p-4">
          <dt className="text-sm text-muted">إجمالي العربون</dt>
          <dd className="mt-1 text-xl font-bold text-brand">{formatSar(s.deposits)}</dd>
        </div>
        <div className="card p-4">
          <dt className="text-sm text-muted">حجوزات مؤكَّدة</dt>
          <dd className="mt-1 text-xl font-bold text-brand">{s.approved}</dd>
        </div>
      </dl>

      {months.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-muted">لا توجد إيرادات مؤكَّدة بعد.</p>
      ) : (
        <div className="card table-wrap mt-6">
          <table className="data-table">
            <caption className="sr-only">الإيرادات الشهرية</caption>
            <thead>
              <tr>
                <th scope="col">الشهر</th>
                <th scope="col">الحجوزات</th>
                <th scope="col">العربون</th>
                <th scope="col">الإيراد</th>
                <th scope="col">
                  <span className="sr-only">المقارنة</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month}>
                  <td className="font-semibold">{m.label}</td>
                  <td>{m.count}</td>
                  <td>{formatSar(m.deposit)}</td>
                  <td>{formatSar(m.total)}</td>
                  <td className="w-40">
                    <div className="h-3 rounded-full bg-surface-2" aria-hidden="true">
                      <div className="h-3 rounded-full bg-brand" style={{ width: `${Math.round((m.total / max) * 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
