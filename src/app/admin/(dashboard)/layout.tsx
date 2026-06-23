import Link from "next/link";
import { Scissors, LayoutDashboard, CalendarDays, Users, Sparkles, ShoppingBag, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { requireAdmin } from "@/lib/session";

// Admin data must always be fresh (bookings, availability edits) — never serve a stale prerendered snapshot.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Marcações", icon: CalendarDays },
  { href: "/admin/barbers", label: "Barbeiros", icon: Users },
  { href: "/admin/services", label: "Serviços", icon: Sparkles },
  { href: "/admin/products", label: "Produtos", icon: ShoppingBag },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card sm:flex sm:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Scissors className="size-5 text-primary" />
          <span className="font-heading text-sm font-semibold text-foreground">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="border-t border-border p-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:hidden">
          <div className="flex items-center gap-2">
            <Scissors className="size-5 text-primary" />
            <span className="font-heading text-sm font-semibold text-foreground">Admin</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sair
            </button>
          </form>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
