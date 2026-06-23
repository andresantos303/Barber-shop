import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/session";

// This is only an optimistic, cookie-presence check (Next.js Proxy must not do DB lookups
// or be the sole line of defense — see lib/session.ts#requireAdmin for the authoritative check
// performed again in the admin layout and in every admin server action).
export const config = {
  matcher: ["/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, {
    cookieName: SESSION_COOKIE_NAME,
    password: process.env.SESSION_SECRET!,
    cookieOptions: { secure: process.env.NODE_ENV === "production", sameSite: "lax" },
  });

  if (!session.adminId) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
