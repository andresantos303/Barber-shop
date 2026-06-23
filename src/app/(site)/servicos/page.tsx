import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getActiveServices, formatPriceCents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Conheça todos os serviços de corte, barba e tratamentos disponíveis para agendamento.",
};

export default async function ServicosPage() {
  const services = await getActiveServices();
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-wide text-primary">Serviços</span>
        <h1 className="font-heading mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          Tudo o que fazemos por si
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Escolha o serviço, e no passo seguinte escolha o barbeiro e o horário que preferir.
        </p>
      </div>

      <div className="mt-12 space-y-12">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="font-heading text-xl font-semibold text-foreground">{category}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {services
                .filter((s) => s.category === category)
                .map((service) => (
                  <div
                    key={service.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5"
                  >
                    <div>
                      <h3 className="font-heading text-base font-semibold text-foreground">{service.name}</h3>
                      {service.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                      )}
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" /> {service.durationMin} min
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-sm font-semibold text-primary">
                        {service.priceCents > 0 ? formatPriceCents(service.priceCents) : "Consulte-nos"}
                      </span>
                      <Link
                        href={`/agendar?serviceId=${service.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "whitespace-nowrap")}
                      >
                        Agendar
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
