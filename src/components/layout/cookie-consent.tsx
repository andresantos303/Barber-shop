"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "bshop-cookie-consent";
const CHANGE_EVENT = "bshop-cookie-consent-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) !== "accepted";
}

function getServerSnapshot() {
  // Never show the banner during SSR; resolved on the client right after hydration.
  return false;
}

function accept() {
  localStorage.setItem(STORAGE_KEY, "accepted");
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function CookieConsent() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90 lg:bottom-4 lg:inset-x-auto lg:right-4 lg:max-w-md sm:p-5">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Utilizamos cookies para melhorar a sua experiência neste site. Ao continuar a navegar, aceita a nossa{" "}
          <Link href="/politica-de-privacidade" className="underline hover:text-foreground">
            política de privacidade
          </Link>
          .
        </p>
        <Button onClick={accept} className="w-full shrink-0 sm:w-auto">
          Aceitar
        </Button>
      </div>
    </div>
  );
}
