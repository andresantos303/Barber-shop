"use client";

import { useActionState } from "react";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login } from "@/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center justify-center gap-2">
          <Scissors className="size-6 text-primary" />
          <span className="font-heading text-lg font-semibold text-foreground">Admin</span>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">André Cabeleireiro</p>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Palavra-passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-11 w-full text-base">
            {pending ? "A entrar..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
