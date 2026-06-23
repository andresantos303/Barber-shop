"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HIDDEN_PREFIXES = ["/agendar", "/admin"];

export function MobileCtaBar() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:hidden [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
      <Link href="/agendar" className={cn(buttonVariants({ variant: "default" }), "h-12 w-full text-base")}>
        Agendar Agora
      </Link>
    </div>
  );
}
