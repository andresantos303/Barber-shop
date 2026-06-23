import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  addBlockedSlot,
  addWorkingHours,
  deleteBlockedSlot,
  deleteWorkingHours,
  updateBarber,
} from "@/actions/admin-barbers";

const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export default async function AdminBarberDetailPage({
  params,
}: {
  params: Promise<{ barberId: string }>;
}) {
  const { barberId } = await params;
  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    include: {
      workingHours: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      blockedSlots: { orderBy: { date: "asc" } },
    },
  });
  if (!barber) notFound();

  const updateBarberWithId = updateBarber.bind(null, barberId);
  const addWorkingHoursWithId = addWorkingHours.bind(null, barberId);
  const deleteWorkingHoursWithId = deleteWorkingHours.bind(null, barberId);
  const addBlockedSlotWithId = addBlockedSlot.bind(null, barberId);
  const deleteBlockedSlotWithId = deleteBlockedSlot.bind(null, barberId);

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">{barber.name}</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Informação</h2>
        <form action={updateBarberWithId} className="mt-3 space-y-3 rounded-xl border border-border bg-card p-5">
          <div>
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input
              name="name"
              defaultValue={barber.name}
              required
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Bio (opcional)</label>
            <textarea
              name="bio"
              defaultValue={barber.bio ?? ""}
              rows={2}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="active" defaultChecked={barber.active} className="size-4" />
            Ativo (disponível para agendamento)
          </label>
          <Button type="submit">Guardar</Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">Horário Semanal</h2>
        <div className="mt-3 space-y-3">
          {DAYS.map((day) => {
            const rows = barber.workingHours.filter((wh) => wh.dayOfWeek === day.value);
            return (
              <div key={day.value} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">{day.label}</p>
                <div className="mt-2 space-y-2">
                  {rows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {row.startTime} – {row.endTime}
                      </span>
                      <form action={deleteWorkingHoursWithId}>
                        <input type="hidden" name="workingHoursId" value={row.id} />
                        <button type="submit" className="text-destructive hover:underline">
                          Remover
                        </button>
                      </form>
                    </div>
                  ))}
                  {rows.length === 0 && <p className="text-sm text-muted-foreground">Sem horário definido (fechado).</p>}
                </div>
                <form action={addWorkingHoursWithId} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="dayOfWeek" value={day.value} />
                  <div>
                    <label className="block text-xs text-muted-foreground">Início</label>
                    <input
                      type="time"
                      name="startTime"
                      required
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground">Fim</label>
                    <input
                      type="time"
                      name="endTime"
                      required
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring"
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm">
                    Adicionar turno
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">Datas Bloqueadas (férias, feriados, etc.)</h2>
        <div className="mt-3 space-y-2">
          {barber.blockedSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-sm"
            >
              <div>
                <span className="font-medium text-foreground">
                  {new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(slot.date)}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {slot.startTime && slot.endTime ? `${slot.startTime} – ${slot.endTime}` : "Dia completo"}
                  {slot.reason ? ` · ${slot.reason}` : ""}
                </span>
              </div>
              <form action={deleteBlockedSlotWithId}>
                <input type="hidden" name="blockedSlotId" value={slot.id} />
                <button type="submit" className="text-destructive hover:underline">
                  Remover
                </button>
              </form>
            </div>
          ))}
          {barber.blockedSlots.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma data bloqueada.</p>
          )}
        </div>

        <form
          action={addBlockedSlotWithId}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div>
            <label className="block text-xs text-muted-foreground">Data</label>
            <input
              type="date"
              name="date"
              required
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground">Início (opcional)</label>
            <input
              type="time"
              name="startTime"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground">Fim (opcional)</label>
            <input
              type="time"
              name="endTime"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground">Motivo (opcional)</label>
            <input
              name="reason"
              placeholder="Férias, feriado..."
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Bloquear
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Deixe início/fim em branco para bloquear o dia completo.
        </p>
      </section>
    </div>
  );
}
