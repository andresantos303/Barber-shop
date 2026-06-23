import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { ANY_BARBER, BUFFER_MIN, BUSINESS_TZ, MIN_LEAD_TIME_MIN } from "@/lib/constants";

export { ANY_BARBER };

// Shortest service (Corte Máquina Uniforme) is 15 min, so that's the finest slot granularity worth offering.
const SLOT_GRANULARITY_MIN = 15;

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Builds a UTC Date for a given Lisbon-local calendar date + "HH:mm" wall-clock time. */
export function zonedDateTimeToUtc(localDate: string, time: string): Date {
  return fromZonedTime(`${localDate}T${time}:00`, BUSINESS_TZ);
}

/** Formats a Date as a Lisbon-local "YYYY-MM-DD" calendar date string. */
export function formatLocalDate(date: Date): string {
  return toZonedTime(date, BUSINESS_TZ).toLocaleDateString("en-CA", { timeZone: BUSINESS_TZ });
}

interface GetAvailableSlotsParams {
  barberId: string;
  serviceId: string;
  /** Lisbon-local calendar date, formatted "YYYY-MM-DD". */
  date: string;
  now?: Date;
}

export async function getAvailableSlots({
  barberId,
  serviceId,
  date,
  now = new Date(),
}: GetAvailableSlotsParams): Promise<string[]> {
  const today = formatLocalDate(now);
  if (date < today) return [];

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const dayOfWeek = toZonedTime(`${date}T12:00:00`, BUSINESS_TZ).getDay();

  const [workingHours, bookings, blockedSlots] = await Promise.all([
    prisma.workingHours.findMany({ where: { barberId, dayOfWeek } }),
    prisma.booking.findMany({
      where: {
        barberId,
        status: "CONFIRMED",
        startAt: { lt: zonedDateTimeToUtc(date, "23:59") },
        endAt: { gt: zonedDateTimeToUtc(date, "00:00") },
      },
    }),
    prisma.blockedSlot.findMany({
      where: {
        date: new Date(`${date}T00:00:00Z`),
        OR: [{ barberId }, { barberId: null }],
      },
    }),
  ]);

  if (blockedSlots.some((slot) => slot.startTime === null && slot.endTime === null)) {
    return []; // whole day blocked (vacation, public holiday, etc.)
  }

  // Busy windows in local minutes-since-midnight, expanded by the mandatory buffer on both sides
  // so two real appointments are never scheduled back-to-back with zero gap.
  const busyWindowsMin = bookings.map((booking) => {
    const startLocal = toZonedTime(booking.startAt, BUSINESS_TZ);
    const endLocal = toZonedTime(booking.endAt, BUSINESS_TZ);
    return [
      startLocal.getHours() * 60 + startLocal.getMinutes() - BUFFER_MIN,
      endLocal.getHours() * 60 + endLocal.getMinutes() + BUFFER_MIN,
    ] as const;
  });

  const blockedWindowsMin = blockedSlots
    .filter((slot) => slot.startTime && slot.endTime)
    .map((slot) => [timeStringToMinutes(slot.startTime!), timeStringToMinutes(slot.endTime!)] as const);

  const nowLocal = toZonedTime(now, BUSINESS_TZ);
  const earliestAllowedMin =
    date === today ? nowLocal.getHours() * 60 + nowLocal.getMinutes() + MIN_LEAD_TIME_MIN : -Infinity;

  const slots: string[] = [];

  for (const window of workingHours) {
    const windowStart = timeStringToMinutes(window.startTime);
    const windowEnd = timeStringToMinutes(window.endTime);

    for (
      let candidateStart = windowStart;
      candidateStart + service.durationMin <= windowEnd;
      candidateStart += SLOT_GRANULARITY_MIN
    ) {
      const candidateEnd = candidateStart + service.durationMin;

      if (candidateStart < earliestAllowedMin) continue;

      const overlapsBooking = busyWindowsMin.some(
        ([busyStart, busyEnd]) => candidateStart < busyEnd && candidateEnd > busyStart
      );
      if (overlapsBooking) continue;

      const overlapsBlocked = blockedWindowsMin.some(
        ([blockStart, blockEnd]) => candidateStart < blockEnd && candidateEnd > blockStart
      );
      if (overlapsBlocked) continue;

      slots.push(minutesToTimeString(candidateStart));
    }
  }

  return Array.from(new Set(slots)).sort();
}

/** Union of available slots across every active barber who performs this service, ordered by barber priority. */
export async function getAvailableSlotsAnyBarber({
  serviceId,
  date,
  now = new Date(),
}: Omit<GetAvailableSlotsParams, "barberId">): Promise<string[]> {
  const barbers = await prisma.barber.findMany({
    where: { active: true, services: { some: { serviceId } } },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  const perBarberSlots = await Promise.all(
    barbers.map((barber) => getAvailableSlots({ barberId: barber.id, serviceId, date, now }))
  );

  return Array.from(new Set(perBarberSlots.flat())).sort();
}

/**
 * Cheap heuristic for disabling obviously-closed calendar days in the date picker: a date is
 * "closed" if it's in the past, the barber has no working-hours rows for that weekday, or the
 * whole day is blocked. This does NOT guarantee open dates have free slots (they might be fully
 * booked) — the time-slot step is the source of truth; this only avoids letting users pick a
 * day that's obviously never bookable (e.g. a barber's weekly day off).
 */
export async function getClosedDates({
  barberId,
  serviceId,
  year,
  month,
  now = new Date(),
}: {
  barberId: string | typeof ANY_BARBER;
  serviceId: string;
  /** 1-indexed month. */
  year: number;
  month: number;
  now?: Date;
}): Promise<string[]> {
  const barbers =
    barberId === ANY_BARBER
      ? await prisma.barber.findMany({
          where: { active: true, services: { some: { serviceId } } },
          select: { id: true },
        })
      : [{ id: barberId }];

  const barberIds = barbers.map((b) => b.id);

  const [workingDaysByBarber, blockedWholeDays] = await Promise.all([
    prisma.workingHours.findMany({
      where: { barberId: { in: barberIds } },
      select: { barberId: true, dayOfWeek: true },
      distinct: ["barberId", "dayOfWeek"],
    }),
    prisma.blockedSlot.findMany({
      where: {
        OR: [{ barberId: { in: barberIds } }, { barberId: null }],
        startTime: null,
        endTime: null,
        date: {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lt: new Date(Date.UTC(year, month, 1)),
        },
      },
      select: { date: true, barberId: true },
    }),
  ]);

  const workingDaysSet = new Map<string, Set<number>>();
  for (const row of workingDaysByBarber) {
    if (!workingDaysSet.has(row.barberId)) workingDaysSet.set(row.barberId, new Set());
    workingDaysSet.get(row.barberId)!.add(row.dayOfWeek);
  }

  const blockedDatesByBarber = new Map<string, Set<string>>();
  const shopWideBlockedDates = new Set<string>();
  for (const slot of blockedWholeDays) {
    const dateStr = slot.date.toISOString().slice(0, 10);
    if (slot.barberId === null) {
      shopWideBlockedDates.add(dateStr);
    } else {
      if (!blockedDatesByBarber.has(slot.barberId)) blockedDatesByBarber.set(slot.barberId, new Set());
      blockedDatesByBarber.get(slot.barberId)!.add(dateStr);
    }
  }

  const today = formatLocalDate(now);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const closedDates: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateStr < today) {
      closedDates.push(dateStr);
      continue;
    }
    if (shopWideBlockedDates.has(dateStr)) {
      closedDates.push(dateStr);
      continue;
    }
    const dayOfWeek = toZonedTime(`${dateStr}T12:00:00`, BUSINESS_TZ).getDay();
    const anyBarberOpen = barberIds.some(
      (id) => workingDaysSet.get(id)?.has(dayOfWeek) && !blockedDatesByBarber.get(id)?.has(dateStr)
    );
    if (!anyBarberOpen) closedDates.push(dateStr);
  }

  return closedDates;
}

/** Finds the first (by barber priority order) active barber who still has this exact slot free. */
export async function findBarberForSlot({
  serviceId,
  date,
  time,
  now = new Date(),
}: Omit<GetAvailableSlotsParams, "barberId"> & { time: string }): Promise<string | null> {
  const barbers = await prisma.barber.findMany({
    where: { active: true, services: { some: { serviceId } } },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  for (const barber of barbers) {
    const slots = await getAvailableSlots({ barberId: barber.id, serviceId, date, now });
    if (slots.includes(time)) return barber.id;
  }

  return null;
}
