import type { Metadata } from "next";
import { searchHalls } from "@/lib/halls";
import { parseHallSearch } from "@/lib/search";
import { HallCard } from "@/components/hall-card";
import { HallSearchForm } from "@/components/hall-search-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "قاعات الأفراح والمناسبات",
  description: "تصفّح قاعات الأفراح والمناسبات حسب المدينة وعدد الحضور وقسم الرجال والنساء والسعر، وقارن بينها قبل إرسال طلب الحجز.",
  alternates: { canonical: "/halls" },
};

export default async function HallsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const search = parseHallSearch(await searchParams);
  const halls = await searchHalls(search);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">قاعات الأفراح والمناسبات</h1>
      <p className="mt-2 text-muted">اضبط الفلاتر لتجد القاعة المناسبة لمناسبتك.</p>
      <div className="mt-6">
        <HallSearchForm values={search} advanced />
      </div>

      <p className="mt-6 text-sm text-muted" role="status">
        {halls.length === 0 ? "لا توجد نتائج" : `${halls.length} قاعة مطابقة`}
      </p>

      {halls.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="font-semibold">لا توجد قاعات تطابق بحثك.</p>
          <p className="mt-1 text-muted">جرّب تخفيف الفلاتر أو اختيار مدينة أخرى.</p>
          <Link href="/halls" className="btn btn-outline mt-4">
            مسح الفلاتر
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {halls.map((h) => (
            <HallCard key={h.id} hall={h} />
          ))}
        </div>
      )}
    </main>
  );
}
