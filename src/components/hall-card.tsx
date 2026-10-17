import Link from "next/link";
import { formatNumber, formatSar, SECTION_SHORT } from "@/lib/format";

type Props = {
  hall: {
    slug: string;
    name: string;
    city: string;
    district: string;
    section: string;
    capacityMen: number;
    capacityWomen: number;
    basePrice: number;
    vendor: { businessName: string };
  };
};

export function HallCard({ hall }: Props) {
  return (
    <article className="card flex flex-col overflow-hidden">
      <div
        className="flex aspect-[16/9] items-end bg-gradient-to-br from-brand to-brand-strong p-4 text-on-brand"
        aria-hidden="true"
      >
        <span className="badge bg-surface text-brand">{SECTION_SHORT[hall.section]}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="min-w-0 truncate text-lg font-bold">
          <Link href={`/halls/${hall.slug}`} className="hover:text-brand">
            {hall.name}
          </Link>
        </h3>
        <p className="min-w-0 truncate text-sm text-muted">
          {hall.city}
          {hall.district ? ` — ${hall.district}` : ""} · {hall.vendor.businessName}
        </p>
        <p className="text-sm">
          {hall.capacityMen > 0 && <span>رجال: {formatNumber(hall.capacityMen)}</span>}
          {hall.capacityMen > 0 && hall.capacityWomen > 0 && <span> · </span>}
          {hall.capacityWomen > 0 && <span>نساء: {formatNumber(hall.capacityWomen)}</span>}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p>
            <span className="text-xs text-muted">تبدأ من </span>
            <strong className="text-brand">{formatSar(hall.basePrice)}</strong>
          </p>
          <Link href={`/halls/${hall.slug}`} className="btn btn-outline btn-sm" aria-label={`عرض تفاصيل ${hall.name}`}>
            التفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
}
