import "server-only";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { BUSINESS_TZ } from "@/lib/constants";
import BookingConfirmationClientEmail from "@/emails/booking-confirmation-client";
import BookingNotificationShopEmail from "@/emails/booking-notification-shop";
import { logger } from "@/lib/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: BUSINESS_TZ,
});

export async function sendBookingConfirmationEmails(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { barber: true, service: true },
  });
  if (!booking) return;

  const formattedDateTime = dateFormatter.format(booking.startAt);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const cancelUrl = `${siteUrl}/agendar/cancelar?token=${booking.cancelToken}`;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to: booking.customerEmail,
      subject: "Marcação Confirmada — André Cabeleireiro",
      react: BookingConfirmationClientEmail({
        customerName: booking.customerName,
        serviceName: booking.service.name,
        barberName: booking.barber.name,
        formattedDateTime,
        address: "Rua da Igreja 31, 4415-937 Seixezelo",
        cancelUrl,
      }),
    }),
    process.env.SHOP_NOTIFICATION_EMAIL
      ? resend.emails.send({
          from,
          to: process.env.SHOP_NOTIFICATION_EMAIL,
          subject: `Nova marcação: ${booking.customerName} — ${booking.service.name}`,
          react: BookingNotificationShopEmail({
            serviceName: booking.service.name,
            barberName: booking.barber.name,
            formattedDateTime,
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            customerEmail: booking.customerEmail,
            notes: booking.notes ?? undefined,
          }),
        })
      : Promise.resolve(null),
  ]);

  const clientEmailFailed = results[0].status === "rejected" || results[0].value?.error;
  if (!clientEmailFailed) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { confirmationEmailSentAt: new Date() },
    });
    logger.info({ bookingId }, "Booking confirmation email sent");
  }

  for (const result of results) {
    if (result.status === "rejected") {
      logger.error({ bookingId, err: result.reason }, "Failed to send booking email");
    } else if (result.value?.error) {
      logger.error({ bookingId, err: result.value.error }, "Resend API error");
    }
  }
}
