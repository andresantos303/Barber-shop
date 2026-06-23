import "server-only";
import { createSwaggerSpec } from "next-swagger-doc";

/**
 * Builds the OpenAPI spec from the `@swagger` JSDoc comments above each route handler in
 * src/app/api. Most mutations (bookings, admin CRUD, auth) go through Server Actions rather than
 * REST routes, so they aren't representable here — this only documents the plain HTTP GET
 * endpoints the booking UI polls.
 */
export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "André Cabeleireiro — API",
        version: "1.0.0",
        description:
          "Public read-only availability endpoints used by the booking flow. Bookings and admin " +
          "operations are mutated via Next.js Server Actions and are not exposed as REST routes.",
      },
      servers: [{ url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000" }],
    },
  });
}
