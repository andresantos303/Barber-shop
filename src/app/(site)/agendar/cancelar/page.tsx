import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BUSINESS_TZ } from "@/lib/constants";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: BUSINESS_TZ,
});

export default async function CancelarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) notFound();

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    include: { barber: true, service: true },
  });
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Cancelar Marcação</h1>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm">
        <p className="font-medium text-foreground">{booking.service.name}</p>
        <p className="mt-1 text-muted-foreground">com {booking.barber.name}</p>
        <p className="mt-1 text-muted-foreground">{dateFormatter.format(booking.startAt)}</p>
      </div>

      {booking.status === "CANCELLED" ? (
        <p className="mt-6 text-sm text-muted-foreground">Esta marcação já foi cancelada.</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground">Tem a certeza que deseja cancelar esta marcação?</p>
          <div className="mt-4">
            <CancelBookingButton token={token} />
          </div>
        </>
      )}
    </div>
  );
}
