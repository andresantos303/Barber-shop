"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ANY_BARBER, findBarberForSlot, getAvailableSlots, zonedDateTimeToUtc } from "@/lib/availability";
import { BUFFER_MIN } from "@/lib/constants";
import { sendBookingConfirmationEmails } from "@/lib/email";
import { contactInfoSchema } from "@/lib/validation";

const bookingSchema = contactInfoSchema.extend({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export type CreateBookingInput = z.infer<typeof bookingSchema>;
export type CreateBookingResult = { success: true; bookingId: string } | { success: false; error: string };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { serviceId, date, time, customerName, customerPhone, customerEmail, notes } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return { success: false, error: "Serviço não encontrado." };
  }

  let barberId = parsed.data.barberId;
  if (barberId === ANY_BARBER) {
    const resolved = await findBarberForSlot({ serviceId, date, time });
    if (!resolved) {
      return { success: false, error: "Este horário já não está disponível. Escolha outro." };
    }
    barberId = resolved;
  }

  const startAt = zonedDateTimeToUtc(date, time);
  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

  // Re-validate against the live slot algorithm right before insert (handles races between two
  // clients booking concurrently); the transaction below re-checks once more at the DB level.
  const availableSlots = await getAvailableSlots({ barberId, serviceId, date });
  if (!availableSlots.includes(time)) {
    return { success: false, error: "Este horário já não está disponível. Escolha outro." };
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const bufferMs = BUFFER_MIN * 60_000;
      const conflicting = await tx.booking.findFirst({
        where: {
          barberId,
          status: "CONFIRMED",
          startAt: { lt: new Date(endAt.getTime() + bufferMs) },
          endAt: { gt: new Date(startAt.getTime() - bufferMs) },
        },
      });
      if (conflicting) throw new SlotTakenError();

      return tx.booking.create({
        data: {
          barberId,
          serviceId,
          startAt,
          endAt,
          customerName,
          customerPhone,
          customerEmail,
          notes: notes || null,
        },
      });
    });

    sendBookingConfirmationEmails(booking.id).catch((err) => {
      console.error("Failed to send booking confirmation emails", err);
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return { success: false, error: "Este horário já não está disponível. Escolha outro." };
    }
    throw error;
  }
}

class SlotTakenError extends Error {}

export async function cancelBookingByToken(cancelToken: string): Promise<{ success: boolean; error?: string }> {
  const booking = await prisma.booking.findUnique({ where: { cancelToken } });
  if (!booking) return { success: false, error: "Marcação não encontrada." };
  if (booking.status === "CANCELLED") return { success: true };

  await prisma.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
  return { success: true };
}
