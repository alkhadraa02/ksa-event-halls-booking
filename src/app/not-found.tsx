import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">الصفحة غير موجودة</h1>
      <p className="mt-2 text-muted">قد يكون الرابط قديماً أو أن القاعة لم تعد منشورة.</p>
      <Link href="/halls" className="btn btn-primary mt-6">
        تصفّح القاعات
      </Link>
    </main>
  );
}
