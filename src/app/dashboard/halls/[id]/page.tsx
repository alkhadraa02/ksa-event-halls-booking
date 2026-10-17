import Link from "next/link";
import { notFound } from "next/navigation";
import { requireVendor } from "@/lib/auth";
import { db } from "@/lib/db";
import { getHallDayMap } from "@/lib/halls";
import { todayKey } from "@/lib/dates";
import { HallForm } from "@/components/hall-form";
import { PackageManager } from "@/components/package-manager";
import { BlockManager } from "@/components/block-manager";

export const dynamic = "force-dynamic";

export default async function ManageHall({ params }: { params: Promise<{ id: string }> }) {
  const { vendor } = await requireVendor();
  const { id } = await params;
  const hall = await db.hall.findUnique({ where: { id }, include: { packages: { orderBy: [{ category: "asc" }, { price: "asc" }] } } });
  if (!hall || hall.vendorId !== vendor.id) notFound();
  const dayMap = await getHallDayMap(hall.id);

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="min-w-0 truncate text-2xl font-bold">{hall.name}</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/halls" className="btn btn-outline btn-sm">
            كل القاعات
          </Link>
          {hall.published && vendor.status === "APPROVED" && (
            <Link href={`/halls/${hall.slug}`} className="btn btn-outline btn-sm">
              عرض الصفحة العامة
            </Link>
          )}
        </div>
      </div>

      <section aria-labelledby="s-info">
        <h2 id="s-info" className="mb-3 text-xl font-bold">
          بيانات القاعة
        </h2>
        <div className="card p-4 sm:p-6">
          <HallForm
            hallId={hall.id}
            initial={{
              name: hall.name,
              city: hall.city,
              district: hall.district,
              description: hall.description,
              section: hall.section,
              capacityMen: hall.capacityMen,
              capacityWomen: hall.capacityWomen,
              basePrice: hall.basePrice,
              depositPercent: hall.depositPercent,
              amenities: hall.amenities,
              published: hall.published,
            }}
          />
        </div>
      </section>

      <section aria-labelledby="s-pkg">
        <h2 id="s-pkg" className="mb-3 text-xl font-bold">
          الباقات والإضافات
        </h2>
        <PackageManager hallId={hall.id} packages={hall.packages} />
      </section>

      <section aria-labelledby="s-cal">
        <h2 id="s-cal" className="mb-3 text-xl font-bold">
          تقويم التوفّر
        </h2>
        <BlockManager hallId={hall.id} dayMap={dayMap} today={todayKey()} />
      </section>
    </div>
  );
}
