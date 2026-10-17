import { db } from "./db";
import { buildDayMap } from "./booking";
import { matchesHall, sortHalls, type HallSearch } from "./search";
import { addDaysKey, todayKey } from "./dates";

export async function searchHalls(search: HallSearch) {
  const halls = await db.hall.findMany({
    where: { published: true, vendor: { status: "APPROVED" } },
    include: { vendor: { select: { businessName: true } }, packages: { where: { active: true }, select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return sortHalls(
    halls.filter((h) => matchesHall(h, search)),
    search.sort,
  );
}

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function getPublicHall(slug: string) {
  const hall = await db.hall.findUnique({
    where: { slug: decodeSlug(slug) },
    include: {
      vendor: true,
      packages: { where: { active: true }, orderBy: [{ category: "asc" }, { price: "asc" }] },
    },
  });
  if (!hall || !hall.published || hall.vendor.status !== "APPROVED") return null;
  return hall;
}

export async function getHallDayMap(hallId: string, days = 400) {
  const from = todayKey();
  const to = addDaysKey(from, days);
  const [bookings, blocked] = await Promise.all([
    db.booking.findMany({
      where: { hallId, status: { in: ["PENDING", "APPROVED"] }, date: { gte: from, lte: to } },
      select: { date: true, status: true },
    }),
    db.blockedDate.findMany({ where: { hallId, date: { gte: from, lte: to } }, select: { date: true } }),
  ]);
  return buildDayMap(bookings, blocked);
}
