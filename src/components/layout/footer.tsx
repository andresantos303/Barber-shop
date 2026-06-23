import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { CONTACT, NAV_LINKS, SITE_NAME } from "@/lib/constants";

// lucide-react dropped brand/logo icons; inline minimal glyphs instead of pulling in a new dependency.
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M15 8.5h-2a1.5 1.5 0 0 0-1.5 1.5V12h3.5l-.5 3H11.5v6h-3v-6H7v-3h1.5v-2.2A4.3 4.3 0 0 1 13 5.5h2v3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">{SITE_NAME}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tradição e estilo, à sua medida.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <FacebookIcon className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Navegação</p>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Contactos</p>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href={CONTACT.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
                  {CONTACT.address}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <a href={CONTACT.phoneHref} className="hover:text-foreground">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={CONTACT.livroReclamacoesUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
                  Livro de Reclamações
                </a>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="hover:text-foreground">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
