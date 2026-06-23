import { NextResponse, type NextRequest } from "next/server";
import { ANY_BARBER, getAvailableSlots, getAvailableSlotsAnyBarber } from "@/lib/availability";
import { logger } from "@/lib/logger";

/**
 * @swagger
 * /api/availability:
 *   get:
 *     summary: List available booking time slots for a given service, barber, and date
 *     description: >
 *       Computes free time slots (Lisbon-local "HH:mm") for a service on a given calendar date,
 *       accounting for the barber's working hours, existing confirmed bookings (with the mandatory
 *       10-minute buffer between appointments), blocked dates, and minimum lead time. Used by the
 *       booking flow's time-selection step.
 *     tags: [Availability]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema: { type: string }
 *         description: ID of the selected service.
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, pattern: '^\d{4}-\d{2}-\d{2}$' }
 *         description: Lisbon-local calendar date, formatted YYYY-MM-DD.
 *       - in: query
 *         name: barberId
 *         required: false
 *         schema: { type: string }
 *         description: ID of the selected barber. Omit, or pass "any", to search across every barber who performs the service.
 *     responses:
 *       200:
 *         description: List of available "HH:mm" slots, sorted ascending.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slots:
 *                   type: array
 *                   items: { type: string, example: "14:30" }
 *       400:
 *         description: Missing or malformed query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get("barberId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    logger.warn({ barberId, serviceId, date }, "GET /api/availability rejected: invalid params");
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const slots =
    !barberId || barberId === ANY_BARBER
      ? await getAvailableSlotsAnyBarber({ serviceId, date })
      : await getAvailableSlots({ barberId, serviceId, date });

  logger.debug({ barberId, serviceId, date, slotCount: slots.length }, "GET /api/availability");
  return NextResponse.json({ slots });
}
