import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = {
  title: "Agendar",
  description: "Marque o seu corte, barba ou tratamento online em poucos minutos.",
};

export const dynamic = "force-dynamic";

async function getBookingData() {
  const [services, barbers] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.barber.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { services: { select: { serviceId: true } } },
    }),
  ]);

  return {
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      durationMin: s.durationMin,
      priceCents: s.priceCents,
    })),
    barbers: barbers.map((b) => ({
      id: b.id,
      name: b.name,
      serviceIds: b.services.map((s) => s.serviceId),
    })),
  };
}

export default async function AgendarPage() {
  const { services, barbers } = await getBookingData();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Agendar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Escolha o serviço, o barbeiro e o horário que melhor lhe convém.
      </p>

      <div className="mt-8">
        <Suspense>
          <BookingFlow services={services} barbers={barbers} />
        </Suspense>
      </div>
    </div>
  );
}
