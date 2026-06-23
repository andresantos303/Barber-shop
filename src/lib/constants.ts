export const SITE_NAME = "André Cabeleireiro";

export const BUSINESS_TZ = "Europe/Lisbon";

/** Minimum gap enforced between two consecutive bookings for the same barber. */
export const BUFFER_MIN = 10;

/** Minimum lead time required before a same-day booking can be made. */
export const MIN_LEAD_TIME_MIN = 30;

/** Sentinel barberId meaning "any available barber" — safe to import from client components. */
export const ANY_BARBER = "any";

/**
 * Priority order (by Barber.slug) for auto-assigning a specific barber when the client books
 * "any available barber" — the first barber in this list who still has the slot free wins.
 * Independent of Barber.order, which only controls display order (team page, admin list, the
 * booking flow's barber-selection step).
 */
export const ANY_BARBER_PRIORITY = ["pedro-castro", "ruben-gomes", "diogo-pimentel", "andre-coelho"];

export const CONTACT = {
  address: "Rua da Igreja 31, 4415-937 Seixezelo",
  phone: "22 114 2708",
  phoneHref: "tel:+351221142708",
  email: "geral@andrecabeleireiro.com",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+da+Igreja+31%2C+4415-937+Seixezelo",
  livroReclamacoesUrl: "https://www.livroreclamacoes.pt",
};

export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/equipa", label: "Equipa" },
  { href: "/produtos", label: "Produtos" },
  { href: "/sobre-nos", label: "Sobre Nós" },
  { href: "/contacto", label: "Contacto" },
];
