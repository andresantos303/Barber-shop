import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    service: { findUnique: vi.fn() },
    workingHours: { findMany: vi.fn() },
    booking: { findMany: vi.fn() },
    blockedSlot: { findMany: vi.fn() },
    barber: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  findBarberForSlot,
  getAvailableSlots,
  getClosedDates,
  zonedDateTimeToUtc,
} from "@/lib/availability";

const mockPrisma = vi.mocked(prisma, true);

const DATE = "2026-07-01";
const PAST_NOW = new Date("2026-06-01T00:00:00Z"); // before DATE, so date >= today and no same-day lead-time restriction

function mockBasics({
  workingHours = [{ startTime: "09:00", endTime: "10:00" }],
  bookings = [] as { startAt: Date; endAt: Date }[],
  blockedSlots = [] as { startTime: string | null; endTime: string | null }[],
  durationMin = 15,
} = {}) {
  mockPrisma.service.findUnique.mockResolvedValue({ id: "svc1", durationMin } as never);
  mockPrisma.workingHours.findMany.mockResolvedValue(workingHours as never);
  mockPrisma.booking.findMany.mockResolvedValue(bookings as never);
  mockPrisma.blockedSlot.findMany.mockResolvedValue(blockedSlots as never);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAvailableSlots", () => {
  it("returns no slots when the barber has no working hours that day", async () => {
    mockBasics({ workingHours: [] });

    const slots = await getAvailableSlots({ barberId: "b1", serviceId: "svc1", date: DATE, now: PAST_NOW });

    expect(slots).toEqual([]);
  });

  it("returns [] immediately for a date in the past, without querying the service", async () => {
    mockBasics();

    const slots = await getAvailableSlots({
      barberId: "b1",
      serviceId: "svc1",
      date: "2026-01-01",
      now: new Date("2026-06-01T00:00:00Z"),
    });

    expect(slots).toEqual([]);
    expect(mockPrisma.service.findUnique).not.toHaveBeenCalled();
  });

  it("returns [] when the service does not exist", async () => {
    mockBasics();
    mockPrisma.service.findUnique.mockResolvedValue(null);

    const slots = await getAvailableSlots({ barberId: "b1", serviceId: "missing", date: DATE, now: PAST_NOW });

    expect(slots).toEqual([]);
  });

  it("generates every 15-minute slot that fits inside the working window when nothing is booked", async () => {
    mockBasics({ durationMin: 15 });

    const slots = await getAvailableSlots({ barberId: "b1", serviceId: "svc1", date: DATE, now: PAST_NOW });

    expect(slots).toEqual(["09:00", "09:15", "09:30", "09:45"]);
  });

  it("excludes the mandatory 10-minute buffer around an existing booking, not just the booking itself", async () => {
    mockBasics({
      durationMin: 15,
      bookings: [{ startAt: zonedDateTimeToUtc(DATE, "09:30"), endAt: zonedDateTimeToUtc(DATE, "09:45") }],
    });

    const slots = await getAvailableSlots({ barberId: "b1", serviceId: "svc1", date: DATE, now: PAST_NOW });

    // 09:15 and 09:45 fall within the 10-min buffer on either side of the 09:30-09:45 booking.
    expect(slots).toEqual(["09:00"]);
  });

  it("excludes slots overlapping a partial blocked window", async () => {
    mockBasics({
      durationMin: 15,
      blockedSlots: [{ startTime: "09:15", endTime: "09:45" }],
    });

    const slots = await getAvailableSlots({ barberId: "b1", serviceId: "svc1", date: DATE, now: PAST_NOW });

    expect(slots).toEqual(["09:00", "09:45"]);
  });

  it("returns no slots when the whole day is blocked", async () => {
    mockBasics({ blockedSlots: [{ startTime: null, endTime: null }] });

    const slots = await getAvailableSlots({ barberId: "b1", serviceId: "svc1", date: DATE, now: PAST_NOW });

    expect(slots).toEqual([]);
  });

  it("does not offer a slot whose duration would overflow the end of the working window", async () => {
    mockBasics({ workingHours: [{ startTime: "09:00", endTime: "09:40" }], durationMin: 30 });

    const slots = await getAvailableSlots({ barberId: "b1", serviceId: "svc1", date: DATE, now: PAST_NOW });

    // 09:15 + 30min = 09:45, which overflows the 09:40 window end.
    expect(slots).toEqual(["09:00"]);
  });

  it("enforces the minimum lead time for same-day bookings", async () => {
    mockBasics({ workingHours: [{ startTime: "00:00", endTime: "23:59" }], durationMin: 15 });
    const now = zonedDateTimeToUtc(DATE, "09:10");

    const slots = await getAvailableSlots({ barberId: "b1", serviceId: "svc1", date: DATE, now });

    // MIN_LEAD_TIME_MIN is 30, so nothing before 09:40 should be offered.
    expect(slots.every((slot) => slot >= "09:40")).toBe(true);
    expect(slots).not.toContain("09:15");
    expect(slots).not.toContain("09:30");
  });
});

describe("findBarberForSlot", () => {
  it("falls through to the next barber when an earlier one has no working hours", async () => {
    mockPrisma.barber.findMany.mockResolvedValue([
      { id: "b1", slug: "b1-slug" },
      { id: "b2", slug: "b2-slug" },
    ] as never);
    mockPrisma.service.findUnique.mockResolvedValue({ id: "svc1", durationMin: 15 } as never);
    mockPrisma.booking.findMany.mockResolvedValue([] as never);
    mockPrisma.blockedSlot.findMany.mockResolvedValue([] as never);
    mockPrisma.workingHours.findMany.mockImplementation((args) => {
      const barberId = (args as { where: { barberId: string } } | undefined)?.where.barberId;
      return Promise.resolve(barberId === "b2" ? [{ startTime: "09:00", endTime: "10:00" }] : []) as never;
    });

    const barberId = await findBarberForSlot({ serviceId: "svc1", date: DATE, time: "09:00", now: PAST_NOW });

    expect(barberId).toBe("b2");
  });

  it("returns null when no eligible barber has the requested time free", async () => {
    mockPrisma.barber.findMany.mockResolvedValue([{ id: "b1", slug: "b1-slug" }] as never);
    mockBasics({ workingHours: [] });

    const barberId = await findBarberForSlot({ serviceId: "svc1", date: DATE, time: "09:00", now: PAST_NOW });

    expect(barberId).toBeNull();
  });

  it("prefers Pedro Castro over Ruben Gomes, Diogo Pimentel, and André Coelho when several are free", async () => {
    // Deliberately scrambled order to prove the priority sort — not just DB/array order — decides.
    mockPrisma.barber.findMany.mockResolvedValue([
      { id: "andre", slug: "andre-coelho" },
      { id: "diogo", slug: "diogo-pimentel" },
      { id: "pedro", slug: "pedro-castro" },
      { id: "ruben", slug: "ruben-gomes" },
    ] as never);
    mockPrisma.service.findUnique.mockResolvedValue({ id: "svc1", durationMin: 15 } as never);
    mockPrisma.booking.findMany.mockResolvedValue([] as never);
    mockPrisma.blockedSlot.findMany.mockResolvedValue([] as never);
    mockPrisma.workingHours.findMany.mockResolvedValue([{ startTime: "09:00", endTime: "10:00" }] as never);

    const barberId = await findBarberForSlot({ serviceId: "svc1", date: DATE, time: "09:00", now: PAST_NOW });

    expect(barberId).toBe("pedro");
  });

  it("falls to the next priority barber (Ruben Gomes) when Pedro Castro is already booked", async () => {
    mockPrisma.barber.findMany.mockResolvedValue([
      { id: "pedro", slug: "pedro-castro" },
      { id: "ruben", slug: "ruben-gomes" },
    ] as never);
    mockPrisma.service.findUnique.mockResolvedValue({ id: "svc1", durationMin: 15 } as never);
    mockPrisma.blockedSlot.findMany.mockResolvedValue([] as never);
    mockPrisma.workingHours.findMany.mockResolvedValue([{ startTime: "09:00", endTime: "10:00" }] as never);
    mockPrisma.booking.findMany.mockImplementation((args) => {
      const barberId = (args as { where: { barberId: string } } | undefined)?.where.barberId;
      return Promise.resolve(
        barberId === "pedro"
          ? [{ startAt: zonedDateTimeToUtc(DATE, "09:00"), endAt: zonedDateTimeToUtc(DATE, "09:15") }]
          : []
      ) as never;
    });

    const barberId = await findBarberForSlot({ serviceId: "svc1", date: DATE, time: "09:00", now: PAST_NOW });

    expect(barberId).toBe("ruben");
  });
});

describe("getClosedDates", () => {
  it("marks every day of the month as closed when no eligible barber is found", async () => {
    mockPrisma.barber.findMany.mockResolvedValue([] as never);
    mockPrisma.workingHours.findMany.mockResolvedValue([] as never);
    mockPrisma.blockedSlot.findMany.mockResolvedValue([] as never);

    const closedDates = await getClosedDates({
      barberId: "any",
      serviceId: "svc1",
      year: 2026,
      month: 7,
      now: PAST_NOW,
    });

    expect(closedDates).toHaveLength(31);
  });

  it("only closes the past days and any shop-wide blocked day, when the barber works every weekday", async () => {
    mockPrisma.workingHours.findMany.mockResolvedValue(
      Array.from({ length: 7 }, (_, dayOfWeek) => ({ barberId: "b1", dayOfWeek })) as never
    );
    mockPrisma.blockedSlot.findMany.mockResolvedValue([
      { date: new Date(Date.UTC(2026, 6, 20)), barberId: null },
    ] as never);

    const closedDates = await getClosedDates({
      barberId: "b1",
      serviceId: "svc1",
      year: 2026,
      month: 7,
      now: new Date("2026-06-15T00:00:00Z"), // before July, so no past-day closures within the month
    });

    expect(closedDates).toEqual(["2026-07-20"]);
  });

  it("closes days before today within the current month", async () => {
    mockPrisma.workingHours.findMany.mockResolvedValue(
      Array.from({ length: 7 }, (_, dayOfWeek) => ({ barberId: "b1", dayOfWeek })) as never
    );
    mockPrisma.blockedSlot.findMany.mockResolvedValue([] as never);

    const closedDates = await getClosedDates({
      barberId: "b1",
      serviceId: "svc1",
      year: 2026,
      month: 7,
      now: zonedDateTimeToUtc("2026-07-15", "12:00"),
    });

    expect(closedDates).toEqual(
      Array.from({ length: 14 }, (_, i) => `2026-07-${String(i + 1).padStart(2, "0")}`)
    );
  });
});
