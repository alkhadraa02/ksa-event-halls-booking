import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHallDayMap, getPublicHall } from "@/lib/halls";
import { todayKey } from "@/lib/dates";
import { BookingForm } from "@/components/booking-form";
import { CATEGORY_KEYS, CATEGORY_LABEL, formatNumber, formatSar, SECTION_LABEL, splitAmenities } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const hall = await getPublicHall(slug);
  if (!hall) return { title: "القاعة غير موجودة", robots: { index: false } };
  const title = `${hall.name} — ${hall.city}`.slice(0, 60);
  const base = `${hall.name} في ${hall.city}${hall.district ? ` (${hall.district})` : ""}. ${SECTION_LABEL[hall.section]}، تبدأ من ${formatSar(hall.basePrice)}. ${hall.description}`;
  const description = (base.length > 160 ? base.slice(0, 157) + "…" : base).padEnd(50, ".");
  return {
    title,
    description,
    alternates: { canonical: `/halls/${hall.slug}` },
    openGraph: { title, description, url: `/halls/${hall.slug}`, type: "website" },
  };
}

export default async function HallPage({ params }: Params) {
  const { slug } = await params;
  const hall = await getPublicHall(slug);
  if (!hall) notFound();
  const dayMap = await getHallDayMap(hall.id);
  const today = todayKey();
  const amenities = splitAmenities(hall.amenities);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: hall.name,
    description: hall.description,
    url: `${SITE_URL}/halls/${hall.slug}`,
    maximumAttendeeCapacity: hall.capacityMen + hall.capacityWomen,
    address: { "@type": "PostalAddress", addressLocality: hall.city, addressCountry: "SA", streetAddress: hall.district },
    priceRange: `من ${hall.basePrice} ريال`,
  };

  const grouped = CATEGORY_KEYS.map((k) => ({ key: k, items: hall.packages.filter((p) => p.category === k) })).filter((g) => g.items.length > 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="مسار التصفح" className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          الرئيسية
        </Link>{" "}
        ›{" "}
        <Link href="/halls" className="hover:text-brand">
          القاعات
        </Link>{" "}
        › <span>{hall.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_26rem]">
        <div className="min-w-0">
          <div className="flex aspect-[16/7] items-end rounded-2xl bg-gradient-to-br from-brand to-brand-strong p-5 text-on-brand" aria-hidden="true">
            <span className="badge bg-surface text-brand">{SECTION_LABEL[hall.section]}</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold">{hall.name}</h1>
          <p className="mt-1 text-muted">
            {hall.city}
            {hall.district ? ` — ${hall.district}` : ""} · تقدّمها {hall.vendor.businessName}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="سعة الرجال" value={hall.capacityMen > 0 ? formatNumber(hall.capacityMen) : "—"} />
            <Stat label="سعة النساء" value={hall.capacityWomen > 0 ? formatNumber(hall.capacityWomen) : "—"} />
            <Stat label="السعر يبدأ من" value={formatSar(hall.basePrice)} />
            <Stat label="العربون" value={`${hall.depositPercent}٪`} />
          </dl>

          {hall.description && (
            <section className="mt-8" aria-labelledby="about">
              <h2 id="about" className="text-xl font-bold">
                عن القاعة
              </h2>
              <p className="mt-2 leading-8">{hall.description}</p>
            </section>
          )}

          {amenities.length > 0 && (
            <section className="mt-8" aria-labelledby="amenities">
              <h2 id="amenities" className="text-xl font-bold">
                المرافق والخدمات
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <li key={a} className="badge badge-muted">
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8" aria-labelledby="packages">
            <h2 id="packages" className="text-xl font-bold">
              الباقات والإضافات
            </h2>
            {grouped.length === 0 ? (
              <p className="mt-2 text-muted">لا توجد باقات إضافية لهذه القاعة حالياً.</p>
            ) : (
              <div className="mt-3 grid gap-5">
                {grouped.map((g) => (
                  <div key={g.key}>
                    <h3 className="font-semibold text-brand">{CATEGORY_LABEL[g.key]}</h3>
                    <ul className="mt-2 grid gap-2">
                      {g.items.map((p) => (
                        <li key={p.id} className="card flex items-start justify-between gap-3 p-3">
                          <div className="min-w-0">
                            <p className="font-semibold">{p.name}</p>
                            {p.description && <p className="text-sm text-muted">{p.description}</p>}
                          </div>
                          <p className="shrink-0 font-semibold">{formatSar(p.price)}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside id="book" aria-labelledby="book-title" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-4 sm:p-5">
            <h2 id="book-title" className="mb-4 text-xl font-bold">
              اطلب حجز هذه القاعة
            </h2>
            <BookingForm
              hall={{
                id: hall.id,
                name: hall.name,
                section: hall.section,
                capacityMen: hall.capacityMen,
                capacityWomen: hall.capacityWomen,
                basePrice: hall.basePrice,
                depositPercent: hall.depositPercent,
              }}
              packages={hall.packages.map((p) => ({ id: p.id, name: p.name, category: p.category, price: p.price, description: p.description }))}
              dayMap={dayMap}
              today={today}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}
