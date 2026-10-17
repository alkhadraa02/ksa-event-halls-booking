import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const halls = await db.hall.findMany({ where: { published: true, vendor: { status: "APPROVED" } }, select: { slug: true, createdAt: true } });
  return [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/halls`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/register`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.2 },
    ...halls.map((h) => ({ url: `${SITE_URL}/halls/${h.slug}`, lastModified: h.createdAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
