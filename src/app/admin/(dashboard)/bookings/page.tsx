import { prisma } from "@/lib/prisma";
import { BUSINESS_TZ } from "@/lib/constants";
import { cancelBookingAdmin, markCompleted, markNoShow, resendConfirmationEmail } from "@/actions/admin-bookings";

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
  NO_SHOW: "Faltou",
};

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: BUSINESS_TZ,
});

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { startAt: "desc" },
    take: 100,
    include: { barber: true, service: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Marcações</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Data/Hora</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Serviço</th>
              <th className="px-4 py-3 font-medium">Barbeiro</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-4 py-3 text-foreground">{dateFormatter.format(booking.startAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{booking.customerName}</div>
                  <div className="text-xs">{booking.customerPhone}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{booking.service.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{booking.barber.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {STATUS_LABEL[booking.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {!booking.confirmationEmailSentAt && (
                      <form action={resendConfirmationEmail}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <button type="submit" className="text-primary hover:underline">
                          Reenviar email
                        </button>
                      </form>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <>
                        <form action={markCompleted}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <button type="submit" className="text-primary hover:underline">
                            Concluída
                          </button>
                        </form>
                        <form action={markNoShow}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <button type="submit" className="text-muted-foreground hover:underline">
                            Faltou
                          </button>
                        </form>
                        <form action={cancelBookingAdmin}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <button type="submit" className="text-destructive hover:underline">
                            Cancelar
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">Ainda não há marcações.</p>
        )}
      </div>
    </div>
  );
}
