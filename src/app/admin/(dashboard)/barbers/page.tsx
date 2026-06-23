import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminBarbersPage() {
  const barbers = await prisma.barber.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Barbeiros</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((barber) => (
          <Link
            key={barber.id}
            href={`/admin/barbers/${barber.id}`}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <p className="font-medium text-foreground">{barber.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {barber.active ? "Ativo" : "Inativo"} · Horários e bloqueios
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
