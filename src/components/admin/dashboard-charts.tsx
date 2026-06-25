"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatPriceCents } from "@/lib/format";
import type { DashboardStats } from "@/lib/dashboard-stats";

const STATUS_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function formatDayLabel(isoDate: string) {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const revenueData = stats.revenueByDay.map((d) => ({ ...d, label: formatDayLabel(d.date), euros: d.revenueCents / 100 }));
  const hasRevenue = revenueData.some((d) => d.revenueCents > 0);
  const hasTopServices = stats.topServices.length > 0;
  const hasBarberData = stats.bookingsByBarber.length > 0;
  const hasStatusData = stats.statusBreakdown.some((d) => d.count > 0);

  const revenueConfig: ChartConfig = { euros: { label: "Receita", color: "var(--chart-1)" } };
  const bookingsConfig: ChartConfig = { bookings: { label: "Marcações", color: "var(--chart-1)" } };
  const statusConfig: ChartConfig = Object.fromEntries(
    stats.statusBreakdown.map((d, i) => [d.status, { label: d.status, color: STATUS_COLORS[i % STATUS_COLORS.length] }])
  );

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      <Card className="border border-border bg-card lg:col-span-3">
        <CardHeader>
          <CardTitle>Receita por dia</CardTitle>
          <CardDescription>Últimos 14 dias — marcações confirmadas e concluídas</CardDescription>
        </CardHeader>
        <CardContent>
          {hasRevenue ? (
            <ChartContainer config={revenueConfig} className="aspect-auto h-64 w-full">
              <BarChart data={revenueData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={48}
                  tickFormatter={(value) => `€${value}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatPriceCents(Math.round(Number(value) * 100))}
                    />
                  }
                />
                <Bar dataKey="euros" fill="var(--color-euros)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Serviços mais procurados</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {hasTopServices ? (
            <ChartContainer config={bookingsConfig} className="aspect-auto h-64 w-full">
              <BarChart data={stats.topServices} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Marcações por barbeiro</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {hasBarberData ? (
            <ChartContainer config={bookingsConfig} className="aspect-auto h-64 w-full">
              <BarChart data={stats.bookingsByBarber} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Estado das marcações</CardTitle>
          <CardDescription>Últimos 30 dias — sinal de saúde do negócio</CardDescription>
        </CardHeader>
        <CardContent>
          {hasStatusData ? (
            <ChartContainer config={statusConfig} className="aspect-auto h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie data={stats.statusBreakdown} dataKey="count" nameKey="status" innerRadius={48} strokeWidth={2}>
                  {stats.statusBreakdown.map((entry, index) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      Ainda sem dados suficientes.
    </div>
  );
}
