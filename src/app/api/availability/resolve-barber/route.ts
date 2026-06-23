import { NextResponse, type NextRequest } from "next/server";
import { findBarberForSlot } from "@/lib/availability";
import { logger } from "@/lib/logger";

/**
 * @swagger
 * /api/availability/resolve-barber:
 *   get:
 *     summary: Resolve "any available barber" to a specific barber for a given slot
 *     description: >
 *       Given a service, date, and time already confirmed free under "any available barber",
 *       returns which specific barber would actually be assigned (by ANY_BARBER_PRIORITY), so the
 *       booking flow can show a real name in the confirmation summary before the client submits.
 *       The same resolution is re-run server-side at booking creation as a safety net.
 *     tags: [Availability]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, pattern: '^\d{4}-\d{2}-\d{2}$' }
 *         description: Lisbon-local calendar date, formatted YYYY-MM-DD.
 *       - in: query
 *         name: time
 *         required: true
 *         schema: { type: string, pattern: '^([01]\d|2[0-3]):[0-5]\d$', example: "14:30" }
 *         description: Lisbon-local "HH:mm" time, as returned by /api/availability.
 *     responses:
 *       200:
 *         description: The resolved barber id, or null if the slot is no longer free for anyone.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 barberId: { type: string, nullable: true }
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
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  if (
    !serviceId ||
    !date ||
    !time ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    logger.warn({ serviceId, date, time }, "GET /api/availability/resolve-barber rejected: invalid params");
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const barberId = await findBarberForSlot({ serviceId, date, time });
  logger.debug({ serviceId, date, time, barberId }, "GET /api/availability/resolve-barber");
  return NextResponse.json({ barberId });
}
