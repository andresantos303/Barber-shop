import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getActiveBarbers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Equipa",
  description: "Conheça os barbeiros da equipa e escolha com quem quer agendar o seu próximo serviço.",
};

export default async function EquipaPage() {
  const barbers = await getActiveBarbers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-wide text-primary">Equipa</span>
        <h1 className="font-heading mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          Conheça os Nossos Barbeiros
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Profissionais experientes, prontos para cuidar do seu visual com atenção ao detalhe.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {barbers.map((barber) => (
          <div key={barber.id} className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
            <div className="flex size-24 items-center justify-center rounded-full bg-secondary">
              <Users className="size-11 text-primary" />
            </div>
            <h2 className="font-heading mt-4 text-lg font-semibold text-foreground">{barber.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {barber.bio ?? "Especialista em corte e barba, atento aos detalhes que fazem a diferença."}
            </p>
            <Link
              href={`/agendar?barberId=${barber.id}`}
              className={cn(buttonVariants({ variant: "default" }), "mt-5 w-full")}
            >
              Agendar com {barber.name.split(" ")[0]}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
