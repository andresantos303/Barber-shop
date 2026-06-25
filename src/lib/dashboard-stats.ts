import { prisma } from "@/lib/prisma";
import { formatLocalDate } from "@/lib/availability";

const REVENUE_DAYS = 14;
const STATS_WINDOW_DAYS = 30;
const TOP_SERVICES_LIMIT = 6;

const REALIZED_STATUSES = new Set(["CONFIRMED", "COMPLETED"]);

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmadas",
  COMPLETED: "Concluídas",
  CANCELLED: "Canceladas",
  NO_SHOW: "Faltas",
};

export interface DashboardStats {
  /** Last REVENUE_DAYS calendar days (Lisbon-local), zero-filled, oldest first. */
  revenueByDay: { date: string; revenueCents: number }[];
  /** Top services by realized booking count over the last STATS_WINDOW_DAYS days. */
  topServices: { name: string; bookings: number }[];
  /** Realized booking count per barber over the last STATS_WINDOW_DAYS days. */
  bookingsByBarber: { name: string; bookings: number }[];
  /** Booking count per status over the last STATS_WINDOW_DAYS days (all 4 statuses, zero-filled). */
  statusBreakdown: { status: string; count: number }[];
}

/**
 * Aggregates the data behind the admin dashboard's charts. "Realized" bookings are CONFIRMED or
 * COMPLETED — CANCELLED/NO_SHOW bookings never happened, so they're excluded from revenue and
 * best-seller counts but still tracked in the status breakdown (a useful health signal on its own).
 */
export async function getDashboardStats(now = new Date()): Promise<DashboardStats> {
  const windowStart = new Date(now.getTime() - STATS_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: { startAt: { gte: windowStart, lte: now } },
    select: {
      startAt: true,
      status: true,
      service: { select: { name: true, priceCents: true } },
      barber: { select: { name: true } },
    },
  });

  const revenueDayKeys: string[] = [];
  for (let i = REVENUE_DAYS - 1; i >= 0; i--) {
    revenueDayKeys.push(formatLocalDate(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)));
  }
  const revenueByDayMap = new Map(revenueDayKeys.map((date) => [date, 0]));

  const serviceCounts = new Map<string, number>();
  const barberCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>();

  for (const booking of bookings) {
    statusCounts.set(booking.status, (statusCounts.get(booking.status) ?? 0) + 1);

    if (!REALIZED_STATUSES.has(booking.status)) continue;

    const day = formatLocalDate(booking.startAt);
    if (revenueByDayMap.has(day)) {
      revenueByDayMap.set(day, revenueByDayMap.get(day)! + booking.service.priceCents);
    }

    serviceCounts.set(booking.service.name, (serviceCounts.get(booking.service.name) ?? 0) + 1);
    barberCounts.set(booking.barber.name, (barberCounts.get(booking.barber.name) ?? 0) + 1);
  }

  const revenueByDay = revenueDayKeys.map((date) => ({ date, revenueCents: revenueByDayMap.get(date)! }));

  const topServices = Array.from(serviceCounts, ([name, count]) => ({ name, bookings: count }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, TOP_SERVICES_LIMIT);

  const bookingsByBarber = Array.from(barberCounts, ([name, count]) => ({ name, bookings: count })).sort(
    (a, b) => b.bookings - a.bookings
  );

  const statusBreakdown = Object.entries(STATUS_LABELS).map(([status, label]) => ({
    status: label,
    count: statusCounts.get(status) ?? 0,
  }));

  return { revenueByDay, topServices, bookingsByBarber, statusBreakdown };
}
