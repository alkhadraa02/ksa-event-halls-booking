import type { Metadata } from "next";
import Link from "next/link";
import { searchHalls } from "@/lib/halls";
import { CITIES } from "@/lib/format";
import { HallCard } from "@/components/hall-card";
import { HallSearchForm } from "@/components/hall-search-form";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "قاعات أفراح ومناسبات في السعودية — احجز قاعتك",
  description: "ابحث عن قاعات الأفراح والمناسبات حسب المدينة والسعة وقسم الرجال والنساء والسعر، واحجز موعدك مع معرفة العربون مسبقاً.",
  alternates: { canonical: "/" },
  openGraph: { title: "قاعات أفراح ومناسبات في السعودية", description: "قارن القاعات وأرسل طلب الحجز بسهولة.", url: "/" },
};

const steps = [
  { n: "١", title: "ابحث وقارن", text: "اختر المدينة وعدد الحضور والقسم المناسب وقارن الأسعار." },
  { n: "٢", title: "اختر التاريخ والباقات", text: "شاهد التقويم الحي وأضف الضيافة والتنسيق والتصوير." },
  { n: "٣", title: "أرسل طلبك", text: "يظهر لك الإجمالي والعربون، وتصلك الموافقة من صاحب القاعة." },
];

export default async function HomePage() {
  const halls = (await searchHalls({ sort: "newest" })).slice(0, 6);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: "منصة حجز قاعات الأفراح والمناسبات في المملكة العربية السعودية",
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="bg-gradient-to-b from-brand-soft to-bg">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h1 className="max-w-2xl text-3xl font-bold leading-snug text-brand-strong sm:text-4xl">
            احجز قاعة مناسبتك في دقائق
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            قاعات أفراح وخطوبة وتخرج في {CITIES.slice(0, 4).join("، ")} وبقية مدن المملكة، بأسعار واضحة وتقويم توفّر لحظي.
          </p>
          <div className="mt-8">
            <HallSearchForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="featured">
        <div className="flex items-end justify-between gap-3">
          <h2 id="featured" className="text-2xl font-bold">
            قاعات مختارة
          </h2>
          <Link href="/halls" className="font-semibold text-brand underline-offset-4 hover:underline">
            عرض كل القاعات
          </Link>
        </div>
        {halls.length === 0 ? (
          <p className="card mt-6 p-8 text-center text-muted">لا توجد قاعات منشورة حالياً. عُد قريباً.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {halls.map((h) => (
              <HallCard key={h.id} hall={h} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-bold">
          كيف يعمل الحجز؟
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="card p-5">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand text-on-brand font-bold" aria-hidden="true">
                {s.n}
              </span>
              <h3 className="mt-3 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="card flex flex-col items-start gap-3 bg-brand-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-strong">هل تملك قاعة مناسبات؟</h2>
            <p className="text-muted">سجّل منشأتك وأدر القاعات والباقات والحجوزات والإيرادات من لوحة واحدة.</p>
          </div>
          <Link href="/register" className="btn btn-primary shrink-0">
            سجّل منشأتك
          </Link>
        </div>
      </section>
    </main>
  );
}
