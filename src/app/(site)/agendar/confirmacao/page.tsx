import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BUSINESS_TZ, CONTACT } from "@/lib/constants";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: BUSINESS_TZ,
});

export default async function ConfirmacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: ref },
    include: { barber: true, service: true },
  });
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 sm:py-24">
      <CheckCircle2 className="mx-auto size-14 text-primary" />
      <h1 className="font-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl">
        Marcação Confirmada
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enviámos os detalhes para o seu email. Até breve!
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-5 text-left text-sm">
        <p className="font-medium text-foreground">{booking.service.name}</p>
        <p className="mt-1 text-muted-foreground">com {booking.barber.name}</p>
        <p className="mt-1 text-muted-foreground">{dateFormatter.format(booking.startAt)}</p>
        <p className="mt-3 text-xs text-muted-foreground">{CONTACT.address}</p>
      </div>

      <Link href="/" className="mt-8 inline-block">
        <Button variant="outline" className="h-11 px-8">
          Voltar ao Início
        </Button>
      </Link>
    </div>
  );
}
