"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cancelBookingByToken } from "@/actions/booking";

export function CancelBookingButton({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setPending(true);
    setError(null);
    const result = await cancelBookingByToken(token);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Não foi possível cancelar a marcação.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Button variant="destructive" disabled={pending} onClick={handleCancel} className="h-11 px-8">
        {pending ? "A cancelar..." : "Sim, cancelar marcação"}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
