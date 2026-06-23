import { NextResponse, type NextRequest } from "next/server";
import { ANY_BARBER, getClosedDates } from "@/lib/availability";
import { logger } from "@/lib/logger";

/**
 * @swagger
 * /api/availability/closed-dates:
 *   get:
 *     summary: List calendar dates with no bookable slots for a given service/barber/month
 *     description: >
 *       Cheap heuristic used to disable obviously-closed days in the booking calendar: a date is
 *       "closed" if it's in the past, no eligible barber works that weekday, or the whole day is
 *       blocked. Does not guarantee every other day has free slots — the /api/availability
 *       endpoint is the source of truth for actual time slots.
 *     tags: [Availability]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         required: true
 *         schema: { type: integer, example: 2026 }
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 12, example: 6 }
 *         description: 1-indexed month.
 *       - in: query
 *         name: barberId
 *         required: false
 *         schema: { type: string }
 *         description: ID of the selected barber. Omit, or pass "any", to consider every barber who performs the service.
 *     responses:
 *       200:
 *         description: List of closed dates, formatted YYYY-MM-DD.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 closedDates:
 *                   type: array
 *                   items: { type: string, example: "2026-06-29" }
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
  const barberId = searchParams.get("barberId") || ANY_BARBER;
  const serviceId = searchParams.get("serviceId");
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!serviceId || !year || !month) {
    logger.warn({ barberId, serviceId, year, month }, "GET /api/availability/closed-dates rejected: invalid params");
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const closedDates = await getClosedDates({ barberId, serviceId, year, month });
  logger.debug(
    { barberId, serviceId, year, month, closedCount: closedDates.length },
    "GET /api/availability/closed-dates"
  );
  return NextResponse.json({ closedDates });
}
