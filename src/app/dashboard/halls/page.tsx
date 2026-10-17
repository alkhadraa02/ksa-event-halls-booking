import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatSar, SECTION_SHORT } from "@/lib/format";
import { HallDeleteButton } from "@/components/hall-row-actions";

export const dynamic = "force-dynamic";

export default async function VendorHalls() {
  const { vendor } = await requireVendor();
  const halls = await db.hall.findMany({
    where: { vendorId: vendor.id },
    include: { _count: { select: { packages: true, bookings: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">القاعات</h1>
        <Link href="/dashboard/halls/new" className="btn btn-primary">
          إضافة قاعة
        </Link>
      </div>
      {halls.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-muted">لا توجد قاعات بعد.</p>
      ) : (
        <div className="card table-wrap mt-4">
          <table className="data-table">
            <caption className="sr-only">قاعات المنشأة</caption>
            <thead>
              <tr>
                <th scope="col">القاعة</th>
                <th scope="col">المدينة</th>
                <th scope="col">القسم</th>
                <th scope="col">السعر</th>
                <th scope="col">الباقات</th>
                <th scope="col">الحالة</th>
                <th scope="col">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {halls.map((h) => (
                <tr key={h.id}>
                  <td className="font-semibold">{h.name}</td>
                  <td>{h.city}</td>
                  <td>{SECTION_SHORT[h.section]}</td>
                  <td>{formatSar(h.basePrice)}</td>
                  <td>{h._count.packages}</td>
                  <td>
                    <span className={`badge ${h.published ? "badge-ok" : "badge-muted"}`}>{h.published ? "منشورة" : "مخفية"}</span>
                  </td>
                  <td>
                    <div className="flex items-start gap-2">
                      <Link href={`/dashboard/halls/${h.id}`} className="btn btn-outline btn-sm" aria-label={`إدارة ${h.name}`}>
                        إدارة
                      </Link>
                      <HallDeleteButton id={h.id} name={h.name} />
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
