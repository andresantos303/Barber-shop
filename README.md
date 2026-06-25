# Barber Shop

A baberShop website — a full-stack, mobile-first Next.js app with a dark/premium design, an online booking system, and an admin panel for managing barbers, services, products, and bookings.

## Features

- **Online booking** (`/agendar`) — a 5-step flow: service → barber (or "any available") → date → time → contact details. Available time slots are computed live from each barber's working hours, existing bookings, and blocked dates, with a mandatory 10-minute buffer enforced between consecutive appointments.
- **Booking confirmation emails** — sent via [Resend](https://resend.com) on successful booking, with a one-click cancellation link. Failed sends are logged without blocking the booking, and can be manually resent from the admin panel.
- **Admin panel** (`/admin`) — password-protected dashboard to:
  - View, complete, mark no-show, or cancel bookings
  - Manage each barber's weekly working hours and blocked dates (vacations, holidays)
  - CRUD services (name, category, duration, price) and products (name, brand, price, image, description)
- **Products showcase** (`/produtos`) — a proper catalog with photos, prices, and descriptions (replacing the original site's unlabeled thumbnails), plus a homepage teaser.
- **Content pages** — Serviços, Equipa, Sobre Nós, Contacto (with embedded map), Livro de Reclamações (PT legal requirement), Política de Privacidade.
- **Mobile-first** — sticky "Agendar Agora" CTA bar on mobile, touch-friendly time-slot grid, responsive down to 320px, Lighthouse scores in the 90s/100 across Performance, Accessibility, Best Practices, and SEO.
- **Structured logging** — every API route, booking creation/cancellation, email send, and admin login goes through a [Pino](https://getpino.io) logger (pretty-printed in dev, JSON in production) instead of `console.*`.
- **API documentation** — the read-only availability endpoints are documented as an OpenAPI 3.0 spec and browsable via a Swagger UI page at `/admin/api-docs` (admin-only).
- **Unit tests** — [Vitest](https://vitest.dev) covers the booking-availability algorithm (working hours, the 10-minute buffer, blocked dates, lead time) and the API route handlers.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Database | PostgreSQL via [Prisma](https://www.prisma.io) (driver adapter: `@prisma/adapter-pg`) |
| Styling | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (Base UI primitives) |
| Auth | Custom session cookies via [iron-session](https://github.com/vvo/iron-session) + bcrypt (admin panel only) |
| Email | [Resend](https://resend.com) + [React Email](https://react.email) |
| Forms/validation | react-hook-form + zod |
| Date/time | date-fns / date-fns-tz (Europe/Lisbon, DST-aware) + react-day-picker |
| Logging | [Pino](https://getpino.io) |
| API docs | [next-swagger-doc](https://github.com/jellydn/next-swagger-doc) (OpenAPI 3.0) + [swagger-ui-react](https://github.com/swagger-api/swagger-ui) |
| Testing | [Vitest](https://vitest.dev) |

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the variables below into a `.env` file at the project root:

```bash
DATABASE_URL=               # PostgreSQL connection string
SESSION_SECRET=             # random string, e.g. `openssl rand -hex 32`
ADMIN_SEED_EMAIL=           # email for the seeded admin login
ADMIN_SEED_PASSWORD=        # password for the seeded admin login

RESEND_API_KEY=             # from resend.com (optional — booking still works without it, emails are just logged as failed)
EMAIL_FROM=                 # e.g. "Bshop <onboarding@resend.dev>" until a custom domain is verified
SHOP_NOTIFICATION_EMAIL=    # where internal "new booking" notifications are sent
NEXT_PUBLIC_SITE_URL=       # e.g. http://localhost:3000 — used to build cancellation links in emails
```

If you don't have a Postgres instance handy, Prisma can spin up a free temporary one:

```bash
npx create-db create --ttl 24h --env .env
```

(This gives you a `CLAIM_URL` you can visit to keep the database permanently — otherwise it expires.)

### 3. Run database migrations and seed data

```bash
npx prisma migrate dev
npx prisma db seed
```

This seeds the 4 barbers, the full 10-service catalog, 4 placeholder products, default Mon–Sat 09:00–19:00 working hours, and one admin user (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site, and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin panel.

### Other useful commands

```bash
npm run build      # production build
npm run start       # run the production build locally
npm run lint        # eslint
npm run test         # run the unit test suite once
npm run test:watch   # run the unit test suite in watch mode
npx prisma studio    # browse/edit the database visually
```

## Testing

Unit tests live alongside the code they cover (`*.test.ts`) and run on [Vitest](https://vitest.dev):

- `src/lib/availability.test.ts` — the slot-computation algorithm: empty working hours, the mandatory 10-minute buffer around existing bookings, partial/whole-day blocked dates, duration overflow at the edge of a working window, same-day lead time, and the "any barber" fallback.
- `src/app/api/availability/route.test.ts` and `src/app/api/availability/closed-dates/route.test.ts` — request validation and correct delegation to the availability lib.

```bash
npm run test
```

## Logging

`src/lib/logger.ts` exports a [Pino](https://getpino.io) logger used in place of `console.*` across the API routes, booking creation/cancellation, email sending, and admin login. Logs are pretty-printed and colorized in development (`NODE_ENV=development`) and plain JSON everywhere else, so they're ready to pipe into a log aggregator in production. Set `LOG_LEVEL` (e.g. `debug`, `info`, `warn`) to override the default.

## API Documentation

The two read-only availability endpoints (`/api/availability` and `/api/availability/closed-dates`) are documented as an OpenAPI 3.0 spec generated from `@swagger` JSDoc comments above each route handler (see `src/lib/swagger.ts`). Browse them via Swagger UI at `/admin/api-docs` (requires an admin login — same auth as the rest of the dashboard). The raw spec is served at `/api/docs/spec`.

Booking creation/cancellation and all admin CRUD operations go through Next.js Server Actions rather than REST routes, so they aren't part of this spec.

## Project Structure

```
prisma/schema.prisma        Data model (Barber, Service, WorkingHours, BlockedSlot, Booking, Product, AdminUser)
prisma/seed.ts               Seed script
src/app/(site)/               Public pages (home, serviços, equipa, produtos, contacto, agendar, ...)
src/app/admin/                 Admin login + protected dashboard (route group)
src/app/api/availability/       Slot/closed-date lookup endpoints used by the booking UI
src/actions/                   Server actions (booking creation, admin CRUD, auth)
src/lib/availability.ts          Core slot-computation algorithm (timezone + buffer logic)
src/lib/availability.test.ts       Unit tests for the slot-computation algorithm
src/lib/session.ts               Admin auth (iron-session) + requireAdmin() guard
src/lib/email.ts                  Resend integration for booking confirmation emails
src/lib/logger.ts                  Pino structured logger
src/lib/swagger.ts                 OpenAPI spec generation (next-swagger-doc)
src/components/booking/            Multi-step booking flow UI
src/components/admin/              Admin CRUD forms (+ Swagger UI client wrapper)
src/emails/                        React Email templates
src/proxy.ts                       Route protection for /admin/** (Next.js 16's renamed "middleware")
```

## Notes

- Admin routes are protected twice: an optimistic cookie check in `src/proxy.ts`, and an authoritative `requireAdmin()` check in the admin layout and every admin server action — per [Next.js's own guidance](https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional) that Proxy should not be the sole line of defense.
- Without a verified sending domain, Resend's sandbox only delivers to the email address that created the Resend account. Verify a domain at [resend.com/domains](https://resend.com/domains) before launch so confirmation emails reach real customers.
