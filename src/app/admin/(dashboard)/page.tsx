import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [todayCount, upcomingCount, barberCount, serviceCount, productCount, stats] = await Promise.all([
    prisma.booking.count({
      where: { status: "CONFIRMED", startAt: { gte: startOfToday, lt: startOfTomorrow } },
    }),
    prisma.booking.count({ where: { status: "CONFIRMED", startAt: { gte: startOfTomorrow } } }),
    prisma.barber.count({ where: { active: true } }),
    prisma.service.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true } }),
    getDashboardStats(),
  ]);

  const cards = [
    { label: "Marcações hoje", value: todayCount, href: "/admin/bookings" },
    { label: "Marcações futuras", value: upcomingCount, href: "/admin/bookings" },
    { label: "Barbeiros ativos", value: barberCount, href: "/admin/barbers" },
    { label: "Serviços ativos", value: serviceCount, href: "/admin/services" },
    { label: "Produtos ativos", value: productCount, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Painel</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <p className="text-2xl font-semibold text-foreground">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>

      <DashboardCharts stats={stats} />
    </div>
  );
}
