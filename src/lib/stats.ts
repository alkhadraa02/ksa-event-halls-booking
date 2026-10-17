import { monthLabel } from "./dates";

type B = { date: string; status: string; totalAmount: number; depositAmount: number };

export function summarize(bookings: B[], today: string) {
  let pending = 0;
  let approved = 0;
  let declined = 0;
  let revenue = 0;
  let deposits = 0;
  let upcoming = 0;
  for (const b of bookings) {
    if (b.status === "PENDING") pending++;
    else if (b.status === "DECLINED") declined++;
    else if (b.status === "APPROVED") {
      approved++;
      revenue += b.totalAmount;
      deposits += b.depositAmount;
      if (b.date >= today) upcoming++;
    }
  }
  return { pending, approved, declined, revenue, deposits, upcoming, total: bookings.length };
}

export function revenueByMonth(bookings: B[]) {
  const map = new Map<string, { month: string; label: string; total: number; deposit: number; count: number }>();
  for (const b of bookings) {
    if (b.status !== "APPROVED") continue;
    const month = b.date.slice(0, 7);
    const [y, m] = month.split("-").map(Number);
    const row = map.get(month) ?? { month, label: monthLabel(y, m - 1), total: 0, deposit: 0, count: 0 };
    row.total += b.totalAmount;
    row.deposit += b.depositAmount;
    row.count += 1;
    map.set(month, row);
  }
  return [...map.values()].sort((a, b) => (a.month < b.month ? 1 : -1));
}

type C = B & { customerName: string; customerPhone: string; customerEmail: string };

export function groupCustomers(bookings: C[]) {
  const map = new Map<
    string,
    { phone: string; name: string; email: string; requests: number; approved: number; spent: number; lastDate: string }
  >();
  for (const b of bookings) {
    const row = map.get(b.customerPhone) ?? {
      phone: b.customerPhone,
      name: b.customerName,
      email: b.customerEmail,
      requests: 0,
      approved: 0,
      spent: 0,
      lastDate: b.date,
    };
    row.requests += 1;
    if (b.status === "APPROVED") {
      row.approved += 1;
      row.spent += b.totalAmount;
    }
    if (b.date > row.lastDate) {
      row.lastDate = b.date;
      row.name = b.customerName;
      if (b.customerEmail) row.email = b.customerEmail;
    }
    map.set(b.customerPhone, row);
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent || b.requests - a.requests);
}
