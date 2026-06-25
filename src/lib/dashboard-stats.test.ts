import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { booking: { findMany: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { zonedDateTimeToUtc } from "@/lib/availability";
import { getDashboardStats } from "@/lib/dashboard-stats";

const mockFindMany = vi.mocked(prisma.booking.findMany);

const NOW = zonedDateTimeToUtc("2026-07-15", "18:00");

function booking({
  date,
  time,
  status,
  serviceName = "Corte de Cabelo",
  priceCents = 1000,
  barberName = "Pedro Castro",
}: {
  date: string;
  time: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  serviceName?: string;
  priceCents?: number;
  barberName?: string;
}) {
  return {
    startAt: zonedDateTimeToUtc(date, time),
    status,
    service: { name: serviceName, priceCents },
    barber: { name: barberName },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDashboardStats", () => {
  it("zero-fills all 14 revenue days and all 4 statuses when there are no bookings", async () => {
    mockFindMany.mockResolvedValue([] as never);

    const stats = await getDashboardStats(NOW);

    expect(stats.revenueByDay).toHaveLength(14);
    expect(stats.revenueByDay.every((d) => d.revenueCents === 0)).toBe(true);
    expect(stats.revenueByDay[13].date).toBe("2026-07-15");
    expect(stats.revenueByDay[0].date).toBe("2026-07-02");
    expect(stats.statusBreakdown).toEqual([
      { status: "Confirmadas", count: 0 },
      { status: "Concluídas", count: 0 },
      { status: "Canceladas", count: 0 },
      { status: "Faltas", count: 0 },
    ]);
    expect(stats.topServices).toEqual([]);
    expect(stats.bookingsByBarber).toEqual([]);
  });

  it("sums realized (CONFIRMED/COMPLETED) revenue per day and excludes cancelled/no-show", async () => {
    mockFindMany.mockResolvedValue([
      booking({ date: "2026-07-15", time: "10:00", status: "CONFIRMED", priceCents: 1500 }),
      booking({ date: "2026-07-15", time: "11:00", status: "COMPLETED", priceCents: 2000 }),
      booking({ date: "2026-07-15", time: "12:00", status: "CANCELLED", priceCents: 9999 }),
      booking({ date: "2026-07-14", time: "09:00", status: "NO_SHOW", priceCents: 9999 }),
      booking({ date: "2026-07-14", time: "09:30", status: "COMPLETED", priceCents: 500 }),
    ] as never);

    const stats = await getDashboardStats(NOW);

    const day15 = stats.revenueByDay.find((d) => d.date === "2026-07-15");
    const day14 = stats.revenueByDay.find((d) => d.date === "2026-07-14");
    expect(day15?.revenueCents).toBe(3500);
    expect(day14?.revenueCents).toBe(500);
  });

  it("ranks top services by realized booking count, capped at 6", async () => {
    const bookings = [];
    for (let i = 0; i < 5; i++) bookings.push(booking({ date: "2026-07-15", time: "10:00", status: "COMPLETED", serviceName: "Corte de Cabelo" }));
    for (let i = 0; i < 3; i++) bookings.push(booking({ date: "2026-07-15", time: "10:00", status: "CONFIRMED", serviceName: "Barba" }));
    bookings.push(booking({ date: "2026-07-15", time: "10:00", status: "CANCELLED", serviceName: "Barba" }));

    mockFindMany.mockResolvedValue(bookings as never);

    const stats = await getDashboardStats(NOW);

    expect(stats.topServices).toEqual([
      { name: "Corte de Cabelo", bookings: 5 },
      { name: "Barba", bookings: 3 },
    ]);
  });

  it("counts realized bookings per barber", async () => {
    mockFindMany.mockResolvedValue([
      booking({ date: "2026-07-15", time: "10:00", status: "COMPLETED", barberName: "Pedro Castro" }),
      booking({ date: "2026-07-15", time: "11:00", status: "CONFIRMED", barberName: "Pedro Castro" }),
      booking({ date: "2026-07-15", time: "12:00", status: "COMPLETED", barberName: "Ruben Gomes" }),
      booking({ date: "2026-07-15", time: "13:00", status: "NO_SHOW", barberName: "Ruben Gomes" }),
    ] as never);

    const stats = await getDashboardStats(NOW);

    expect(stats.bookingsByBarber).toEqual([
      { name: "Pedro Castro", bookings: 2 },
      { name: "Ruben Gomes", bookings: 1 },
    ]);
  });

  it("includes cancelled/no-show in the status breakdown even though they're excluded elsewhere", async () => {
    mockFindMany.mockResolvedValue([
      booking({ date: "2026-07-15", time: "10:00", status: "CONFIRMED" }),
      booking({ date: "2026-07-15", time: "11:00", status: "COMPLETED" }),
      booking({ date: "2026-07-15", time: "12:00", status: "COMPLETED" }),
      booking({ date: "2026-07-15", time: "13:00", status: "CANCELLED" }),
      booking({ date: "2026-07-15", time: "14:00", status: "NO_SHOW" }),
    ] as never);

    const stats = await getDashboardStats(NOW);

    expect(stats.statusBreakdown).toEqual([
      { status: "Confirmadas", count: 1 },
      { status: "Concluídas", count: 2 },
      { status: "Canceladas", count: 1 },
      { status: "Faltas", count: 1 },
    ]);
  });

  it("queries only the last 30 days up to now", async () => {
    mockFindMany.mockResolvedValue([] as never);

    await getDashboardStats(NOW);

    const call = mockFindMany.mock.calls[0][0];
    expect(call?.where?.startAt).toEqual({
      gte: new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
      lte: NOW,
    });
  });
});
