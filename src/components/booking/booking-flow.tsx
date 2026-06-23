"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { contactInfoSchema, type ContactInfo } from "@/lib/validation";
import { formatPriceCents } from "@/lib/format";
import { createBooking } from "@/actions/booking";
import { ANY_BARBER } from "@/lib/constants";
import { formatDateKey } from "@/components/booking/booking-calendar";

// react-day-picker is the heaviest dependency in this flow and is only needed once the user
// reaches the date step, so it's split out of the initial bundle.
const BookingCalendar = dynamic(() => import("@/components/booking/booking-calendar"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center">
      <Loader2 className="size-5 animate-spin text-primary" />
    </div>
  ),
});

interface ServiceOption {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  priceCents: number;
}

interface BarberOption {
  id: string;
  name: string;
  serviceIds: string[];
}

const STEPS = ["Serviço", "Barbeiro", "Data", "Hora", "Contacto"] as const;

function groupSlots(slots: string[]) {
  const groups: { label: string; slots: string[] }[] = [
    { label: "Manhã", slots: [] },
    { label: "Tarde", slots: [] },
    { label: "Noite", slots: [] },
  ];
  for (const slot of slots) {
    const hour = Number(slot.split(":")[0]);
    if (hour < 13) groups[0].slots.push(slot);
    else if (hour < 19) groups[1].slots.push(slot);
    else groups[2].slots.push(slot);
  }
  return groups.filter((g) => g.slots.length > 0);
}

export function BookingFlow({ services, barbers }: { services: ServiceOption[]; barbers: BarberOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [serviceId, setServiceId] = useState<string | null>(searchParams.get("serviceId"));
  const [barberId, setBarberId] = useState<string | null>(searchParams.get("barberId"));
  // Deep links from /servicos or /equipa pre-select a service, so start past step 1 in that case.
  const [step, setStep] = useState(() => (searchParams.get("serviceId") ? 2 : 1));
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const [closedDates, setClosedDates] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingClosedDates, setLoadingClosedDates] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [services, serviceId]);
  const eligibleBarbers = useMemo(
    () => (serviceId ? barbers.filter((b) => b.serviceIds.includes(serviceId)) : []),
    [barbers, serviceId]
  );
  const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category))), [services]);

  // Fetch which dates are obviously closed for the visible calendar month whenever the date
  // step is active, or the service/barber/month selection changes.
  useEffect(() => {
    if (step !== 3 || !serviceId) return;
    const currentServiceId = serviceId;
    let cancelled = false;

    async function loadClosedDates() {
      setLoadingClosedDates(true);
      try {
        const params = new URLSearchParams({
          serviceId: currentServiceId,
          barberId: barberId ?? ANY_BARBER,
          year: String(calendarMonth.getFullYear()),
          month: String(calendarMonth.getMonth() + 1),
        });
        const res = await fetch(`/api/availability/closed-dates?${params}`);
        const data = await res.json();
        if (!cancelled) setClosedDates(new Set(data.closedDates));
      } finally {
        if (!cancelled) setLoadingClosedDates(false);
      }
    }

    loadClosedDates();
    return () => {
      cancelled = true;
    };
  }, [step, serviceId, barberId, calendarMonth]);

  function fetchSlots(selectedDate: Date) {
    if (!serviceId) return;
    setLoadingSlots(true);
    setSlots(null);
    const params = new URLSearchParams({
      serviceId,
      barberId: barberId ?? ANY_BARBER,
      date: formatDateKey(selectedDate),
    });
    fetch(`/api/availability?${params}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInfo>({ resolver: zodResolver(contactInfoSchema) });

  async function onSubmit(contact: ContactInfo) {
    if (!serviceId || !barberId || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await createBooking({
      serviceId,
      barberId,
      date: formatDateKey(date),
      time,
      ...contact,
    });
    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      if (result.error.includes("disponível")) {
        setStep(4);
        fetchSlots(date);
      }
      return;
    }

    router.push(`/agendar/confirmacao?ref=${result.bookingId}`);
  }

  return (
    <div>
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === step;
          const isDone = stepNumber < step;
          return (
            <li key={label} className="flex flex-1 items-center gap-1">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  isActive && "bg-primary text-primary-foreground",
                  isDone && "bg-primary/20 text-primary",
                  !isActive && !isDone && "bg-secondary text-muted-foreground"
                )}
              >
                {isDone ? <Check className="size-3.5" /> : stepNumber}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:inline",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {stepNumber < STEPS.length && <span className="mx-1 h-px flex-1 bg-border" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {step === 1 && (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-sm font-semibold text-foreground">{category}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {services
                    .filter((s) => s.category === category)
                    .map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setServiceId(s.id);
                          setBarberId(null);
                          setStep(2);
                        }}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-colors hover:border-primary",
                          serviceId === s.id ? "border-primary bg-primary/5" : "border-border bg-card"
                        )}
                      >
                        <p className="font-medium text-foreground">{s.name}</p>
                        <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" /> {s.durationMin} min
                          </span>
                          {s.priceCents > 0 && <span>{formatPriceCents(s.priceCents)}</span>}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <BackButton onClick={() => setStep(1)} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setBarberId(ANY_BARBER);
                  setDate(undefined);
                  setStep(3);
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors hover:border-primary",
                  barberId === ANY_BARBER ? "border-primary bg-primary/5" : "border-border bg-card"
                )}
              >
                <p className="font-medium text-foreground">Qualquer barbeiro disponível</p>
                <p className="mt-1 text-xs text-muted-foreground">Mostra os horários de toda a equipa</p>
              </button>
              {eligibleBarbers.map((barber) => (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => {
                    setBarberId(barber.id);
                    setDate(undefined);
                    setStep(3);
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors hover:border-primary",
                    barberId === barber.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}
                >
                  <p className="font-medium text-foreground">{barber.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <BackButton onClick={() => setStep(2)} />
            <div className="mt-4 flex justify-center rounded-xl border border-border bg-card p-2 sm:p-4">
              <BookingCalendar
                selected={date}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                closedDates={closedDates}
                onSelect={(selected) => {
                  if (!selected) return;
                  setDate(selected);
                  setTime(null);
                  fetchSlots(selected);
                  setStep(4);
                }}
              />
            </div>
            {loadingClosedDates && (
              <p className="mt-2 text-center text-xs text-muted-foreground">A verificar disponibilidade...</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <BackButton onClick={() => setStep(3)} />
            {loadingSlots && (
              <div className="mt-6 flex justify-center">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            )}
            {!loadingSlots && slots && slots.length === 0 && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Sem horários disponíveis neste dia. Escolha outra data.
              </p>
            )}
            {!loadingSlots && slots && slots.length > 0 && (
              <div className="mt-6 space-y-6">
                {groupSlots(slots).map((group) => (
                  <div key={group.label}>
                    <p className="text-sm font-semibold text-foreground">{group.label}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {group.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setTime(slot);
                            setStep(5);
                          }}
                          className={cn(
                            "h-11 rounded-md border text-sm font-medium transition-colors hover:border-primary",
                            time === slot ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 5 && service && date && time && (
          <div>
            <BackButton onClick={() => setStep(4)} />

            <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
              <p className="font-medium text-foreground">{service.name}</p>
              <p className="mt-1 text-muted-foreground">
                {new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(date)} às {time}
              </p>
              <p className="text-muted-foreground">
                {barberId === ANY_BARBER
                  ? "Qualquer barbeiro disponível"
                  : eligibleBarbers.find((b) => b.id === barberId)?.name}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nome</label>
                <input
                  {...register("customerName")}
                  className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
                />
                {errors.customerName && <p className="mt-1 text-xs text-destructive">{errors.customerName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Telemóvel</label>
                <input
                  type="tel"
                  {...register("customerPhone")}
                  className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
                />
                {errors.customerPhone && <p className="mt-1 text-xs text-destructive">{errors.customerPhone.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  {...register("customerEmail")}
                  className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
                />
                {errors.customerEmail && <p className="mt-1 text-xs text-destructive">{errors.customerEmail.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Notas (opcional)</label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                />
              </div>

              {submitError && <p className="text-sm text-destructive">{submitError}</p>}

              <Button type="submit" disabled={submitting} className="h-12 w-full text-base">
                {submitting ? "A confirmar..." : "Confirmar Marcação"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="size-4" /> Voltar
    </button>
  );
}
