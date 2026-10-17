import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { VENDOR_STATUS_LABEL } from "@/lib/format";
import { VendorActions } from "@/components/vendor-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "لوحة الإدارة", robots: { index: false, follow: false } };

export default async function AdminPage() {
  await requireAdmin();
  const [vendors, hallCount, bookingCount] = await Promise.all([
    db.vendor.findMany({ include: { user: { select: { email: true, name: true } }, _count: { select: { halls: true } } }, orderBy: { createdAt: "desc" } }),
    db.hall.count(),
    db.booking.count(),
  ]);
  const order = { PENDING: 0, REJECTED: 1, APPROVED: 2 } as Record<string, number>;
  vendors.sort((a, b) => order[a.status] - order[b.status]);
  const pending = vendors.filter((v) => v.status === "PENDING").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">لوحة إدارة المنصة</h1>
      <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["المنشآت", vendors.length],
          ["بانتظار الاعتماد", pending],
          ["القاعات", hallCount],
          ["طلبات الحجز", bookingCount],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <dt className="text-sm text-muted">{l}</dt>
            <dd className="mt-1 text-xl font-bold text-brand">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 text-xl font-bold">اعتماد المنشآت</h2>
      {vendors.length === 0 ? (
        <p className="card mt-3 p-8 text-center text-muted">لا توجد منشآت مسجَّلة.</p>
      ) : (
        <div className="card table-wrap mt-3">
          <table className="data-table">
            <caption className="sr-only">المنشآت</caption>
            <thead>
              <tr>
                <th scope="col">المنشأة</th>
                <th scope="col">المسؤول</th>
                <th scope="col">المدينة</th>
                <th scope="col">القاعات</th>
                <th scope="col">الحالة</th>
                <th scope="col">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td className="font-semibold">{v.businessName}</td>
                  <td>
                    <p>{v.user.name}</p>
                    <p dir="ltr" className="text-start text-sm text-muted">
                      {v.user.email}
                    </p>
                  </td>
                  <td>{v.city}</td>
                  <td>{v._count.halls}</td>
                  <td>
                    <span className={`badge ${v.status === "APPROVED" ? "badge-ok" : v.status === "PENDING" ? "badge-warn" : "badge-bad"}`}>{VENDOR_STATUS_LABEL[v.status]}</span>
                  </td>
                  <td>
                    <VendorActions id={v.id} status={v.status} name={v.businessName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
