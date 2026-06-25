import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacte a barbearia André Cabeleireiro em Seixezelo: endereço, telefone e horário.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <span className="text-xs font-medium uppercase tracking-wide text-primary">Contacto</span>
      <h1 className="font-heading mt-2 text-3xl font-semibold text-foreground sm:text-4xl">Fale Connosco</h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Endereço</p>
              <a href={CONTACT.mapsUrl} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                {CONTACT.address}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Telefone</p>
              <a href={CONTACT.phoneHref} className="text-sm text-muted-foreground hover:text-foreground">
                {CONTACT.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Email</p>
              <a href={`mailto:${CONTACT.email}`} className="text-sm text-muted-foreground hover:text-foreground">
                {CONTACT.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Horário</p>
              <p className="text-sm text-muted-foreground">Segunda a Sexta - 9:30h - 12:30h | 14:00h - 19:30h</p>
              <p className="text-sm text-muted-foreground">Sábado - 8:00h - 12:30h | 14:00h - 18:00h</p>
            </div>
          </div>

          <Link href="/agendar" className={cn(buttonVariants({ variant: "default" }), "h-12 w-full text-base")}>
            Agendar Agora
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Localização no mapa"
            className="h-full min-h-[360px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(CONTACT.address)}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
}
