import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type IronSession } from "iron-session";

export interface SessionData {
  adminId?: string;
  adminEmail?: string;
}

export const SESSION_COOKIE_NAME = "bshop_admin_session";

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), {
    cookieName: SESSION_COOKIE_NAME,
    password: process.env.SESSION_SECRET!,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  });
}

/**
 * Authoritative auth check (the "Data Access Layer" per Next.js's own Proxy guidance:
 * Proxy only does an optimistic cookie-presence check and must not be the sole line of
 * defense). Call this at the top of the admin layout and every admin server action.
 */
export async function requireAdmin(): Promise<SessionData & { adminId: string }> {
  const session = await getSession();
  if (!session.adminId) {
    redirect("/admin/login");
  }
  return session as SessionData & { adminId: string };
}
