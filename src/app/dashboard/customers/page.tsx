import { requireVendor } from "@/lib/auth";
import { db } from "@/lib/db";
import { groupCustomers } from "@/lib/stats";
import { formatSar } from "@/lib/format";
import { formatDateAr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function Customers() {
  const { vendor } = await requireVendor();
  const bookings = await db.booking.findMany({ where: { hall: { vendorId: vendor.id } } });
  const customers = groupCustomers(bookings);
  return (
    <div>
      <h1 className="text-2xl font-bold">العملاء</h1>
      <p className="mt-1 text-muted">كل من أرسل طلب حجز لقاعاتك، مجمّعين برقم الجوال.</p>
      {customers.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-muted">لا يوجد عملاء بعد.</p>
      ) : (
        <div className="card table-wrap mt-4">
          <table className="data-table">
            <caption className="sr-only">العملاء</caption>
            <thead>
              <tr>
                <th scope="col">العميل</th>
                <th scope="col">الجوال</th>
                <th scope="col">الطلبات</th>
                <th scope="col">المؤكَّدة</th>
                <th scope="col">إجمالي المؤكَّد</th>
                <th scope="col">آخر مناسبة</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone}>
                  <td>
                    <p className="font-semibold">{c.name}</p>
                    {c.email && (
                      <p dir="ltr" className="text-start text-sm text-muted">
                        {c.email}
                      </p>
                    )}
                  </td>
                  <td dir="ltr" className="text-start">
                    {c.phone}
                  </td>
                  <td>{c.requests}</td>
                  <td>{c.approved}</td>
                  <td>{formatSar(c.spent)}</td>
                  <td>{formatDateAr(c.lastDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
