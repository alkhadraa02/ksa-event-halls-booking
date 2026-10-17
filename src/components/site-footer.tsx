import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 قاعات المناسبات — منصة عرض وحجز قاعات الأفراح. العربون المعروض تقديري ولا يوجد دفع إلكتروني حقيقي.</p>
        <nav aria-label="روابط التذييل" className="flex gap-4">
          <Link href="/halls" className="py-1 hover:text-brand">
            القاعات
          </Link>
          <Link href="/register" className="py-1 hover:text-brand">
            انضم كمنشأة
          </Link>
          <Link href="/login" className="py-1 hover:text-brand">
            دخول
          </Link>
        </nav>
      </div>
    </footer>
  );
}
